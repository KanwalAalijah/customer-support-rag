import { NextRequest, NextResponse } from 'next/server';
import { generateEmbeddings } from '@/lib/embeddings';
import { vectorStore } from '@/lib/vectorStore';
import { chunkText, cleanText } from '@/lib/textProcessing';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    let totalChunks = 0;

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      let text = '';

      // Process based on file type
      if (file.name.endsWith('.pdf')) {
        // PDF support disabled - pdfjs-dist requires canvas which isn't available in Node.js
        return NextResponse.json(
          {
            error: 'PDF files are not currently supported',
            details: 'Please use TXT files instead. You can convert your PDF to TXT using online tools or extract the text and paste it into a .txt file.'
          },
          { status: 400 }
        );
      } else if (file.name.endsWith('.txt')) {
        text = new TextDecoder().decode(buffer);
      } else {
        continue; // Skip unsupported file types
      }

      if (!text || text.trim().length === 0) {
        return NextResponse.json(
          { error: `File ${file.name} appears to be empty` },
          { status: 400 }
        );
      }

      // Clean and chunk the text
      const cleanedText = cleanText(text);
      const chunks = chunkText(cleanedText, 500, 50, file.name);

      console.log(`Processing ${file.name}: ${chunks.length} chunks created`);

      // Generate embeddings for each chunk
      const chunkContents = chunks.map(chunk => chunk.content);

      console.log('Generating embeddings...');
      const embeddings = await generateEmbeddings(chunkContents);
      console.log('Embeddings generated successfully');

      // Add to vector store
      console.log('Adding documents to Pinecone...');
      const documents = chunks.map((chunk, index) => ({
        id: `${file.name}-${chunk.metadata.chunkIndex}`,
        content: chunk.content,
        embedding: embeddings[index],
        metadata: chunk.metadata,
      }));

      await vectorStore.addDocuments(documents);
      console.log('Documents added to Pinecone successfully');

      totalChunks += chunks.length;
    }

    const totalDocuments = await vectorStore.getDocumentCount();

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${files.length} file(s) into ${totalChunks} chunks`,
      totalDocuments: totalDocuments,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process documents', details: error.message },
      { status: 500 }
    );
  }
}
