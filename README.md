# Customer Support AI Assistant with RAG

A fully functional customer support AI assistant that uses Retrieval Augmented Generation (RAG) to answer questions based on uploaded policy documents.

## Features

- Upload TXT policy documents
- Automatic document chunking and embedding generation
- Semantic search using Pinecone vector database
- AI-powered question answering with Google Gemini
- Source citations for all answers
- Modern, responsive UI with dark mode support
- Persistent vector storage (survives server restarts)

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Backend
- **Google Gemini Embeddings** - text-embedding-004 model (384 dimensions)
- **Pinecone Vector Database** - Persistent vector storage with free tier
- **Google Gemini API** - For AI-generated responses (generous free tier!)

## Architecture

1. **Document Upload Flow**:
   - User uploads TXT files
   - Files are parsed and text is extracted
   - Text is chunked into smaller pieces (500 words with 50 word overlap)
   - Each chunk gets embedded using Google Gemini text-embedding-004
   - Embeddings stored in Pinecone vector database

2. **Query Flow**:
   - User asks a question
   - Question is embedded using the same model
   - Semantic search finds top 3 most relevant document chunks
   - Context is built from relevant chunks
   - AI generates answer (or returns excerpts if no API key)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Add the following to your `.env` file:
   - **GEMINI_API_KEY**: Get from https://makersuite.google.com/app/apikey
   - **PINECONE_API_KEY**: Get from https://www.pinecone.io/
   - **PINECONE_INDEX_NAME**: Create an index with 384 dimensions and cosine metric

3. **Create Pinecone Index**:
   - Sign up at https://www.pinecone.io/
   - Create a new index:
     - **Name**: customer-support-rag (or your choice)
     - **Dimensions**: 384
     - **Metric**: cosine

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Usage

1. **Upload Documents**:
   - Click the upload area or drag & drop TXT files
   - Click "Upload Documents" to process them
   - Wait for confirmation (embeddings are generated and stored in Pinecone)

2. **Ask Questions**:
   - Type your question in the chat input
   - Press Enter or click Send
   - Get answers with source citations

## How It Works (RAG Pipeline)

### Embeddings
- Uses **Google Gemini text-embedding-004** model
- Serverless-compatible (works on Vercel)
- Generates 384-dimensional vectors
- Free tier with generous limits

### Vector Search
- **Pinecone** vector database for persistent storage
- Cosine similarity for finding relevant chunks
- Returns top-k most similar documents
- Fast, scalable vector search

### Response Generation
- **With Gemini API Key**: Gemini Pro generates natural answers (free tier: 15 RPM, 1M tokens/day!)
- **Without API Key**: Returns relevant document excerpts
- Always includes source citations

## File Structure

```
customer-support-rag/
├── app/
│   ├── api/
│   │   ├── upload/         # Document upload endpoint
│   │   │   └── route.ts
│   │   └── chat/           # Query/chat endpoint
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Main UI
├── lib/
│   ├── embeddings.ts       # Embedding generation
│   ├── vectorStore.ts      # In-memory vector storage
│   └── textProcessing.ts   # Text chunking utilities
├── .env.example
├── package.json
└── README.md
```

## Cost Breakdown

- **Gemini Embeddings**: FREE tier (generous limits)
- **Pinecone Vector Store**: FREE tier (100K vectors, 1 index)
- **Gemini API**: FREE tier includes 15 requests/min, 1M tokens/day
- **Hosting**: FREE (Vercel free tier or Pro)

**Total Cost**: $0 for small-scale usage with free tiers!

## Limitations

- TXT files only (PDF support requires additional configuration)
- Free tier limits:
  - Pinecone: 100K vectors
  - Gemini: 15 RPM, 1M tokens/day
- For production, consider:
  - Rate limiting
  - Authentication
  - File size limits
  - Upgrading to paid tiers for higher limits

## Future Enhancements

- [x] Persistent vector storage (✅ Implemented with Pinecone)
- [ ] Support for more file types (PDF, DOCX, MD, CSV)
- [ ] Multi-language support
- [ ] Conversation history
- [ ] Document management (delete, update)
- [ ] Analytics dashboard

## License

MIT
