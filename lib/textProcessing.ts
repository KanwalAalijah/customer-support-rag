// Text chunking utilities
export interface TextChunk {
  content: string;
  metadata: {
    source: string;
    pageNumber?: number;
    chunkIndex: number;
  };
}

export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
  source: string = 'unknown',
  pageNumber?: number
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const words = text.split(/\s+/);

  let currentChunk: string[] = [];
  let chunkIndex = 0;

  for (let i = 0; i < words.length; i++) {
    currentChunk.push(words[i]);

    // Check if we've reached the chunk size
    if (currentChunk.length >= chunkSize || i === words.length - 1) {
      chunks.push({
        content: currentChunk.join(' '),
        metadata: {
          source,
          pageNumber,
          chunkIndex,
        },
      });

      // Create overlap for next chunk
      if (i < words.length - 1) {
        currentChunk = currentChunk.slice(-overlap);
        chunkIndex++;
      }
    }
  }

  return chunks;
}

export function cleanText(text: string): string {
  // Remove excessive whitespace
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}
