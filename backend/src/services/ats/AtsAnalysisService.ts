import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_to_prevent_crash',
});

export class AtsAnalysisService {
  /**
   * Generates embeddings for a given text using text-embedding-3-small
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.warn("OPENAI_API_KEY is not set. Mocking embedding.");
        return new Array(1536).fill(0).map(() => Math.random());
      }
      
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Calculates cosine similarity between two vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Extracts keywords, skills, and structure from resume text using GPT-4o
   */
  static async extractResumeDetails(resumeText: string) {
    if (!process.env.OPENAI_API_KEY) {
      return {
        fullName: "John Doe",
        skills: ["JavaScript", "React"],
        experience: [{ company: "Tech Inc", role: "Developer" }],
        education: [],
        sections: ["Summary", "Skills", "Experience"]
      };
    }

    const prompt = `
      Extract the following information from the resume text below:
      - Full Name
      - Email
      - Phone
      - List of all skills (programming languages, tools, soft skills)
      - Experience (Company, Role, Start/End dates)
      - Education
      - Sections present (e.g., Summary, Experience, Projects, Certifications)
      
      Return as a structured JSON object exactly like this:
      {
        "fullName": "...",
        "email": "...",
        "phone": "...",
        "skills": ["..."],
        "experience": [{"company": "...", "role": "...", "startDate": "...", "endDate": "..."}],
        "education": [{"degree": "...", "institution": "...", "year": "..."}],
        "sections": ["..."]
      }

      Resume Text:
      ${resumeText.substring(0, 10000)}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Extracts required skills and keywords from Job Description
   */
  static async extractJdDetails(jdText: string) {
    if (!process.env.OPENAI_API_KEY) {
      return { keywords: ["React", "TypeScript", "Node.js"] };
    }

    const prompt = `
      Extract all required and preferred skills, tools, and certifications from this Job Description.
      Return as a structured JSON object exactly like this:
      {
        "keywords": ["skill1", "skill2"]
      }

      Job Description:
      ${jdText.substring(0, 10000)}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Generates AI suggestions for improving the resume based on JD
   */
  static async generateSuggestions(resumeText: string, jdText: string, missingKeywords: string[]) {
    if (!process.env.OPENAI_API_KEY) {
      return ["Add more measurable achievements.", "Include keywords: " + missingKeywords.join(", ")];
    }

    const prompt = `
      You are an expert technical recruiter and ATS system. Review the candidate's resume against the job description.
      
      Missing critical keywords: ${missingKeywords.join(', ')}
      
      Provide 3-5 short, actionable suggestions to improve this resume for this specific job.
      Format as a JSON array of strings:
      {
        "suggestions": ["Suggestion 1", "Suggestion 2"]
      }
      
      Resume:
      ${resumeText.substring(0, 5000)}
      
      Job Description:
      ${jdText.substring(0, 5000)}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{"suggestions":[]}');
    return parsed.suggestions;
  }
}
