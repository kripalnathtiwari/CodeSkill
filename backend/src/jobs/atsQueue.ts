import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { AtsAnalysisService } from '../services/ats/AtsAnalysisService';
import prisma from '../config/db';
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', { maxRetriesPerRequest: null });

export const atsQueue = new Queue('ats-analysis', { connection: connection as any });

export const atsWorker = new Worker('ats-analysis', async (job: Job) => {
  const { analysisId, resumeId, jobDescriptionId } = job.data;
  
  try {
    // 1. Mark as processing
    await prisma.atsAnalysis.update({
      where: { id: analysisId },
      data: { status: 'PROCESSING' }
    });

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    const jd = await prisma.jobDescription.findUnique({ where: { id: jobDescriptionId } });

    if (!resume || !jd) throw new Error("Resume or JD not found");

    const resumeText = resume.extractedText || '';
    const jdText = jd.content;

    // 2. Extract Data using AI
    const resumeData = await AtsAnalysisService.extractResumeDetails(resumeText);
    const jdData = await AtsAnalysisService.extractJdDetails(jdText);
    
    await prisma.resume.update({
      where: { id: resumeId },
      data: { parsedData: resumeData }
    });
    
    await prisma.jobDescription.update({
      where: { id: jobDescriptionId },
      data: { extractedKeywords: jdData.keywords }
    });

    // 3. Keyword Match (Case-insensitive)
    const resumeSkills = (resumeData.skills || []).map((s: string) => s.toLowerCase());
    const jdKeywords = (jdData.keywords || []).map((k: string) => k.toLowerCase());
    
    const matchedKeywords = jdKeywords.filter((kw: string) => resumeSkills.some((s: string) => s.includes(kw) || kw.includes(s)));
    const missingKeywords = jdKeywords.filter((kw: string) => !matchedKeywords.includes(kw));

    const keywordMatchScore = jdKeywords.length > 0 
      ? Math.round((matchedKeywords.length / jdKeywords.length) * 100) 
      : 100;

    // 4. Semantic Similarity (Embeddings)
    // In a real prod environment, we would chunk and average embeddings. 
    // We will do a single embedding for the whole text (or top skills) here.
    const resumeEmbed = await AtsAnalysisService.generateEmbedding(resumeSkills.join(' '));
    const jdEmbed = await AtsAnalysisService.generateEmbedding(jdKeywords.join(' '));
    const semanticSimilarity = AtsAnalysisService.cosineSimilarity(resumeEmbed, jdEmbed);
    
    const semanticMatchScore = Math.max(0, Math.min(100, Math.round(semanticSimilarity * 100)));

    // 5. Formatting & Experience Analysis (Mock heuristics)
    // Check if required sections exist
    const requiredSections = ["summary", "experience", "education"];
    const foundSections = (resumeData.sections || []).map((s: string) => s.toLowerCase());
    const missingSections = requiredSections.filter(s => !foundSections.some((fs: string) => fs.includes(s)));
    
    const formattingScore = Math.max(0, 100 - (missingSections.length * 15));
    const experienceScore = resumeData.experience?.length > 0 ? 80 : 40; // simplified
    const grammarScore = 90; // mock grammar score

    // 6. Overall Weighted Score Calculation
    // Keyword Match (35%), Semantic Match (20%), Experience (15%), Formatting (10%), Grammar (5%), Projects/Ed/Cert (15% distributed)
    const overallScore = Math.round(
      (keywordMatchScore * 0.35) +
      (semanticMatchScore * 0.20) +
      (experienceScore * 0.15) +
      (formattingScore * 0.10) +
      (grammarScore * 0.05) +
      (85 * 0.15) // default for others
    );

    // 7. AI Suggestions
    const suggestions = await AtsAnalysisService.generateSuggestions(resumeText, jdText, missingKeywords);

    // 8. Save Final Report
    await prisma.atsAnalysis.update({
      where: { id: analysisId },
      data: {
        status: 'COMPLETED',
        overallScore,
        keywordMatchScore,
        semanticMatchScore,
        formattingScore,
        experienceScore,
        grammarScore,
        matchedKeywords: matchedKeywords,
        missingKeywords: missingKeywords,
        aiSuggestions: suggestions,
        formattingIssues: missingSections.map(s => `Missing required section: ${s}`),
      }
    });

    console.log(`[ATS] Analysis ${analysisId} completed. Score: ${overallScore}`);
  } catch (error: any) {
    console.error(`[ATS] Analysis ${analysisId} failed:`, error);
    await prisma.atsAnalysis.update({
      where: { id: analysisId },
      data: { 
        status: 'FAILED',
        errorMessage: error.message || 'Unknown error occurred during analysis.'
      }
    });
  }
}, { connection: connection as any });

atsWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
