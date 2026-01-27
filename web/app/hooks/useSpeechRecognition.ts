"use client";
import { useCallback, useState, useRef } from "react";

interface UseSpeechRecognitionOptions {
    onResult: (text: string) => void;
    onError?: (msg: string) => void;
    language?: string;
}

export function useSpeechRecognition({ onResult, onError, language = "hi-IN" }: UseSpeechRecognitionOptions) {
    const [active, setActive] = useState(false);
    const recognitionRef = useRef<any>(null);
    
    const supported = typeof window !== "undefined" &&
        (("webkitSpeechRecognition" in window) || ("SpeechRecognition" in window));

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // Ignore errors when stopping
            }
            recognitionRef.current = null;
        }
        setActive(false);
    }, []);

    const start = useCallback(() => {
        if (!supported) {
            onError?.("Speech recognition not supported in this browser");
            return;
        }

        // Stop any existing recognition
        stop();

        try {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = language;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.continuous = false;

            recognition.onstart = () => {
                setActive(true);
            };

            recognition.onresult = (event: any) => {
                if (event.results && event.results.length > 0) {
                    const transcript = event.results[0][0].transcript;
                    if (transcript) {
                        onResult(transcript);
                    }
                }
                setActive(false);
                recognitionRef.current = null;
            };

            recognition.onerror = (event: any) => {
                let errorMsg = "Voice input failed";
                switch (event.error) {
                    case "no-speech":
                        errorMsg = "No speech detected. Please try again.";
                        break;
                    case "audio-capture":
                        errorMsg = "No microphone found. Please check your device.";
                        break;
                    case "not-allowed":
                        errorMsg = "Microphone access denied. Please allow microphone permission.";
                        break;
                    case "network":
                        errorMsg = "Network error. Please check your connection.";
                        break;
                    case "aborted":
                        errorMsg = "Speech recognition was aborted.";
                        break;
                    default:
                        errorMsg = `Voice input failed: ${event.error}`;
                }
                onError?.(errorMsg);
                setActive(false);
                recognitionRef.current = null;
            };

            recognition.onend = () => {
                setActive(false);
                recognitionRef.current = null;
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err: any) {
            onError?.(`Unable to start speech recognition: ${err.message || "Unknown error"}`);
            setActive(false);
        }
    }, [supported, onResult, onError, language, stop]);

    return { start, stop, active, supported };
}