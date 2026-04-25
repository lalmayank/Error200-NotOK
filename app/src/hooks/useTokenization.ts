import { useMemo, useCallback } from "react";

export interface TokenizedParagraph {
  id: number;
  words: TokenWord[];
}

export interface TokenWord {
  index: number;
  text: string;
  paragraphId: number;
}

/**
 * Tokenization Engine
 * Takes raw string input and 'rehydrates' it into a token-indexed corpus.
 * Every word is wrapped in an individual span with a unique global index.
 * Preserves paragraph structure.
 */
export function useTokenization() {
  const tokenize = useCallback((rawText: string): TokenizedParagraph[] => {
    if (!rawText.trim()) return [];

    const paragraphs = rawText.split(/\n+/).filter((p) => p.trim().length > 0);
    let globalIndex = 0;

    return paragraphs.map((paragraph, pIdx) => {
      // Split by whitespace but preserve the delimiters as part of words
      // We use a regex that matches words including attached punctuation
      const tokens = paragraph.match(/\S+/g) || [];
      const words: TokenWord[] = tokens.map((token) => {
        const word: TokenWord = {
          index: globalIndex++,
          text: token,
          paragraphId: pIdx,
        };
        return word;
      });

      return { id: pIdx, words };
    });
  }, []);

  const countWords = useCallback((rawText: string): number => {
    if (!rawText.trim()) return 0;
    const tokens = rawText.match(/\S+/g);
    return tokens ? tokens.length : 0;
  }, []);

  return useMemo(
    () => ({
      tokenize,
      countWords,
    }),
    [tokenize, countWords]
  );
}
