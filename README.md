# Customer Support AI Assistant with RAG

A fully functional customer support AI assistant that uses Retrieval Augmented Generation (RAG) to answer questions based on uploaded policy documents.

## Features

- Upload PDF and TXT policy documents
- Automatic document chunking and embedding generation
- Semantic search using vector similarity
- AI-powered question answering
- Source citations for all answers
- Modern, responsive UI with dark mode support

## Tech Stack (100% Free!)

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Backend (All Free/Open Source)
- **@xenova/transformers** - Free embeddings (runs locally, no API needed!)
- **In-memory Vector Store** - Simple cosine similarity search
- **pdf-parse** - PDF text extraction
- **Google Gemini API** (Optional) - For AI-generated responses (generous free tier!)

## Architecture

1. **Document Upload Flow**:
   - User uploads PDF/TXT files
   - Files are parsed and text is extracted
   - Text is chunked into smaller pieces (500 words with 50 word overlap)
   - Each chunk gets embedded using free Xenova transformers
   - Embeddings stored in in-memory vector store

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

2. **Optional: Add Google Gemini API Key** (for AI-generated responses):
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key
   # Get free API key from: https://makersuite.google.com/app/apikey
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Usage

1. **Upload Documents**:
   - Click the upload area or drag & drop PDF/TXT files
   - Click "Upload Documents" to process them
   - Wait for confirmation

2. **Ask Questions**:
   - Type your question in the chat input
   - Press Enter or click Send
   - Get answers with source citations

## How It Works (RAG Pipeline)

### Embeddings
- Uses **Xenova/all-MiniLM-L6-v2** model
- Completely free, runs in Node.js
- No external API calls needed
- Generates 384-dimensional vectors

### Vector Search
- Cosine similarity for finding relevant chunks
- Returns top-k most similar documents
- Fast in-memory search

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

- **Embeddings**: FREE (runs locally)
- **Vector Store**: FREE (in-memory)
- **PDF Parsing**: FREE (open-source)
- **Hosting**: FREE (Vercel free tier)
- **Gemini API** (Optional): FREE tier includes 15 requests/min, 1M tokens/day!

## Limitations

- Vector store is in-memory (resets on server restart)
- For production, consider:
  - Persistent vector DB (Pinecone free tier, Supabase, or Weaviate)
  - Rate limiting
  - Authentication
  - File size limits

## Future Enhancements

- [ ] Persistent vector storage
- [ ] Support for more file types (DOCX, MD, CSV)
- [ ] Multi-language support
- [ ] Conversation history
- [ ] Document management (delete, update)
- [ ] Analytics dashboard

## License

MIT
