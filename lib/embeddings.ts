// Free embeddings using Xenova Transformers (runs locally in Node.js)
import { pipeline } from '@xenova/transformers';

let embeddingModel: any = null;

export async function getEmbeddingModel() {
  if (!embeddingModel) {
    console.log('Loading Xenova embedding model...');
    const startTime = Date.now();
    try {
      // Using a lightweight, free embedding model
      embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      const loadTime = Date.now() - startTime;
      console.log(`Embedding model loaded successfully in ${loadTime}ms`);
    } catch (error) {
      console.error('Failed to load embedding model:', error);
      throw new Error(`Failed to load embedding model: ${error}`);
    }
  }
  return embeddingModel;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbeddingModel();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings = await Promise.all(texts.map(text => generateEmbedding(text)));
  return embeddings;
}

// Cosine similarity for vector comparison
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
