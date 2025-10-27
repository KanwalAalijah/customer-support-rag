// Pinecone-based vector store for persistent storage
import { Pinecone } from '@pinecone-database/pinecone';

export interface Document {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    source: string;
    pageNumber?: number;
    chunkIndex: number;
  };
}

class VectorStore {
  private pinecone: Pinecone | null = null;
  private indexName: string;
  private initialized: boolean = false;

  constructor() {
    this.indexName = process.env.PINECONE_INDEX_NAME || 'customer-support-rag';
  }

  private async initialize() {
    if (this.initialized) return;

    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error(
        'PINECONE_API_KEY is not set. Please add it to your .env file.\n' +
        'Get your API key from https://www.pinecone.io/'
      );
    }

    this.pinecone = new Pinecone({
      apiKey: apiKey,
    });

    this.initialized = true;
  }

  private async getIndex() {
    await this.initialize();
    if (!this.pinecone) {
      throw new Error('Pinecone client not initialized');
    }
    return this.pinecone.index(this.indexName);
  }

  async addDocument(doc: Document) {
    const index = await this.getIndex();

    await index.upsert([
      {
        id: doc.id,
        values: doc.embedding,
        metadata: {
          content: doc.content,
          source: doc.metadata.source,
          ...(doc.metadata.pageNumber !== undefined && { pageNumber: doc.metadata.pageNumber }),
          chunkIndex: doc.metadata.chunkIndex,
        },
      },
    ]);
  }

  async addDocuments(docs: Document[]) {
    const index = await this.getIndex();

    // Pinecone recommends batches of 100 vectors
    const batchSize = 100;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      const vectors = batch.map(doc => ({
        id: doc.id,
        values: doc.embedding,
        metadata: {
          content: doc.content,
          source: doc.metadata.source,
          ...(doc.metadata.pageNumber !== undefined && { pageNumber: doc.metadata.pageNumber }),
          chunkIndex: doc.metadata.chunkIndex,
        },
      }));

      await index.upsert(vectors);
    }
  }

  async similaritySearch(queryEmbedding: number[], k: number = 3): Promise<Document[]> {
    const index = await this.getIndex();

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: k,
      includeMetadata: true,
    });

    // Convert Pinecone results back to Document format
    return queryResponse.matches.map(match => ({
      id: match.id,
      content: (match.metadata?.content as string) || '',
      embedding: match.values || [],
      metadata: {
        source: (match.metadata?.source as string) || '',
        pageNumber: match.metadata?.pageNumber as number | undefined,
        chunkIndex: (match.metadata?.chunkIndex as number) || 0,
      },
    }));
  }

  async clear() {
    const index = await this.getIndex();

    // Delete all vectors in the index
    await index.deleteAll();
  }

  async getDocumentCount(): Promise<number> {
    const index = await this.getIndex();

    const stats = await index.describeIndexStats();
    return stats.totalRecordCount || 0;
  }

  async getAllDocuments(): Promise<Document[]> {
    // Note: Pinecone doesn't have a native "get all" operation
    // This is a placeholder that returns an empty array
    // In practice, you should track document IDs separately if you need this functionality
    console.warn('getAllDocuments() is not fully supported with Pinecone');
    return [];
  }
}

// Global singleton instance
export const vectorStore = new VectorStore();
