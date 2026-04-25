/**
 * useTextEngine Hook
 * Handles text input, tokenization, word-highlight automation, and WCAG compliance
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export const useTextEngine = () => {
  const [tokens, setTokens] = useState([]);
  const [highlightedTokenIndex, setHighlightedTokenIndex] = useState(0);
  const [isAutoHighlighting, setIsAutoHighlighting] = useState(false);
  const [wordDelay, setWordDelay] = useState(300); // ms between word highlights
  const highlightIntervalRef = useRef(null);
  const textInputRef = useRef(null);

  /**
   * Tokenize text into array of token objects
   * Each token has: id, word, startIndex, endIndex, position
   */
  const tokenizeText = useCallback((text) => {
    const wordRegex = /\S+/g;
    const tokenArray = [];
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      tokenArray.push({
        id: `token-${tokenArray.length}`,
        word: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        position: tokenArray.length,
      });
    }

    setTokens(tokenArray);
    setHighlightedTokenIndex(0);
    return tokenArray;
  }, []);

  /**
   * Handle text input / pasting
   */
  const handleTextInput = useCallback(
    (text) => {
      if (text && text.trim()) {
        tokenizeText(text);
        setIsAutoHighlighting(false);
        if (highlightIntervalRef.current) {
          clearInterval(highlightIntervalRef.current);
        }
      }
    },
    [tokenizeText]
  );

  /**
   * Progressive word-highlight automaton
   * Sequentially highlights tokens based on wordDelay timing
   */
  const startAutoHighlight = useCallback(() => {
    if (tokens.length === 0) return;

    setIsAutoHighlighting(true);
    setHighlightedTokenIndex(0);

    if (highlightIntervalRef.current) {
      clearInterval(highlightIntervalRef.current);
    }

    let currentIndex = 0;

    highlightIntervalRef.current = setInterval(() => {
      if (currentIndex < tokens.length) {
        setHighlightedTokenIndex(currentIndex);
        currentIndex += 1;
      } else {
        // Loop or stop
        currentIndex = 0;
        setHighlightedTokenIndex(0);
      }
    }, wordDelay);
  }, [tokens, wordDelay]);

  /**
   * Stop auto-highlighting
   */
  const stopAutoHighlight = useCallback(() => {
    setIsAutoHighlighting(false);
    if (highlightIntervalRef.current) {
      clearInterval(highlightIntervalRef.current);
      highlightIntervalRef.current = null;
    }
  }, []);

  /**
   * Manually navigate to next word (keyboard support)
   */
  const nextWord = useCallback(() => {
    setHighlightedTokenIndex((prev) => (prev + 1) % tokens.length);
  }, [tokens.length]);

  /**
   * Manually navigate to previous word (keyboard support)
   */
  const prevWord = useCallback(() => {
    setHighlightedTokenIndex((prev) => (prev - 1 + tokens.length) % tokens.length);
  }, [tokens.length]);

  /**
   * Adjust word delay / speed of highlighting
   */
  const setAutoHighlightSpeed = useCallback((delay) => {
    setWordDelay(delay);
    if (isAutoHighlighting) {
      stopAutoHighlight();
      // Restart with new delay
      setTimeout(() => {
        startAutoHighlight();
      }, 0);
    }
  }, [isAutoHighlighting, startAutoHighlight, stopAutoHighlight]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (highlightIntervalRef.current) {
        clearInterval(highlightIntervalRef.current);
      }
    };
  }, []);

  return {
    tokens,
    highlightedTokenIndex,
    isAutoHighlighting,
    wordDelay,
    textInputRef,
    handleTextInput,
    tokenizeText,
    startAutoHighlight,
    stopAutoHighlight,
    nextWord,
    prevWord,
    setAutoHighlightSpeed,
  };
};
