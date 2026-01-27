import { useState, useCallback, useRef } from "react";

interface UseTextToSpeechOptions {
  onError?: (error: string) => void;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTextToSpeech({
  onError,
  rate = 1,
  pitch = 1,
  volume = 1,
}: UseTextToSpeechOptions = {}) {
  const [speaking, setSpeaking] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, messageId: string) => {
    if (!window.speechSynthesis) {
      onError?.("Text-to-speech is not supported in this browser");
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#{1,6}\s+/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      onError?.("No text to speak");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setSpeaking(true);
      setCurrentMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeaking(false);
      setCurrentMessageId(null);
    };

    utterance.onerror = (event) => {
      setSpeaking(false);
      setCurrentMessageId(null);
      onError?.(`Speech error: ${event.error}`);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, volume, onError]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setCurrentMessageId(null);
    }
  }, []);

  const toggle = useCallback((text: string, messageId: string) => {
    if (speaking && currentMessageId === messageId) {
      stop();
    } else {
      speak(text, messageId);
    }
  }, [speaking, currentMessageId, speak, stop]);

  return {
    speak,
    stop,
    toggle,
    speaking,
    currentMessageId,
  };
}