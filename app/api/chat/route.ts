import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding } from '@/lib/embeddings';
import { vectorStore } from '@/lib/vectorStore';

// Initialize Gemini client (use Gemini API key)
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    // Check if there are any documents in the vector store
    const docCount = await vectorStore.getDocumentCount();
    console.log(`Vector store has ${docCount} documents`);

    if (docCount === 0) {
      return NextResponse.json({
        response: "I don't have any documents to search through yet. Please upload some policy documents first.",
        sources: [],
      });
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(message);

    // Find relevant documents
    const relevantDocs = await vectorStore.similaritySearch(queryEmbedding, 3);

    // Build context from relevant documents
    const context = relevantDocs
      .map((doc, i) => `[Document ${i + 1}: ${doc.metadata.source}]\n${doc.content}`)
      .join('\n\n');

    // If no Gemini API key, return a basic response with context
    if (!genAI) {
      return NextResponse.json({
        response: `Based on the uploaded documents, here are the most relevant sections:\n\n${context}\n\n(Note: Set GEMINI_API_KEY environment variable to get AI-generated responses)`,
        sources: relevantDocs.map(doc => `${doc.metadata.source} (Chunk ${doc.metadata.chunkIndex + 1})`),
      });
    }

    // Generate AI response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a helpful customer support assistant. Answer questions based on the provided policy documents.
If the answer isn't in the documents, say so. Be concise and helpful.

Context from policy documents:
${context}

User Question: ${message}

Please provide a clear, helpful answer based on the context above.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({
      response,
      sources: relevantDocs.map(doc => `${doc.metadata.source} (Chunk ${doc.metadata.chunkIndex + 1})`),
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process query', details: error.message },
      { status: 500 }
    );
  }
}
