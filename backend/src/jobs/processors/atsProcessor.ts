import { Job } from 'bullmq';
import { AtsAnalysisService } from '../../services/ats/AtsAnalysisService';
import prisma from '../../config/db';
import logger from '../../config/logger';

export async function processAtsAnalysis(job: Job) {
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
    const resumeEmbed = await AtsAnalysisService.generateEmbedding(resumeSkills.join(' '));
    const jdEmbed = await AtsAnalysisService.generateEmbedding(jdKeywords.join(' '));
    const semanticSimilarity = AtsAnalysisService.cosineSimilarity(resumeEmbed, jdEmbed);
    
    const semanticMatchScore = Math.max(0, Math.min(100, Math.round(semanticSimilarity * 100)));

    // 5. Formatting & Experience Analysis (Mock heuristics)
    const requiredSections = ["summary", "experience", "education"];
    const foundSections = (resumeData.sections || []).map((s: string) => s.toLowerCase());
    const missingSections = requiredSections.filter((s: string) => !foundSections.some((fs: string) => fs.includes(s)));
    
    const formattingScore = Math.max(0, 100 - (missingSections.length * 15));
    const experienceScore = resumeData.experience?.length > 0 ? 80 : 40; // simplified
    const grammarScore = 90; // mock grammar score

    // 6. Overall Weighted Score Calculation
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
        formattingIssues: missingSections.map((s: string) => `Missing required section: ${s}`),
      }
    });

    logger.info(`[ATS] Analysis ${analysisId} completed. Score: ${overallScore}`);
  } catch (error: any) {
    logger.error(`[ATS] Analysis ${analysisId} failed: ${error.message}`);
    await prisma.atsAnalysis.update({
      where: { id: analysisId },
      data: { 
        status: 'FAILED',
        errorMessage: error.message || 'Unknown error occurred during analysis.'
      }
    });
    // Rethrow error so BullMQ knows it failed and can apply retry strategies
    throw error;
  }
}
