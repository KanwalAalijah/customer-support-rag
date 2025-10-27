// Embeddings using Google Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Please add it to your .env file.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generateEmbedding(text: string, taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' = 'RETRIEVAL_DOCUMENT'): Promise<number[]> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: 'text-embedding-004',
  });

  // Use embedContent with just the text string
  const result = await model.embedContent(text);

  // Check if we need to truncate dimensions to 384
  const embedding = result.embedding.values;
  if (embedding.length > 384) {
    return embedding.slice(0, 384);
  }

  return embedding;
}

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  return generateEmbedding(text, 'RETRIEVAL_QUERY');
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  console.log(`Generating embeddings for ${texts.length} text chunks using Gemini...`);
  const startTime = Date.now();

  // Generate embeddings in parallel with rate limiting
  const batchSize = 10; // Process 10 at a time to avoid rate limits
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );
    embeddings.push(...batchEmbeddings);
  }

  const duration = Date.now() - startTime;
  console.log(`Generated ${embeddings.length} embeddings in ${duration}ms`);

  return embeddings;
}

// Cosine similarity for vector comparison
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
