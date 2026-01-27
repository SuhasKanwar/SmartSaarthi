"use client";

import { useState, useCallback, useRef, useEffect, type FormEvent } from "react";
import Orb from "@/components/Orb";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useFileSelection } from "../hooks/useFileSelection";
import { microserviceApi } from "@/lib/api";
import { Mic, MicOff, Paperclip, X, Volume2, VolumeX, Loader2, Send } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function BotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [textInput, setTextInput] = useState("");
    const [autoSpeak, setAutoSpeak] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { files, trigger: triggerFileSelect, clearAll: clearFiles, removeAt, inputProps } = useFileSelection(
        ".pdf,.txt,.md,.png,.jpg,.jpeg"
    );

    const { speak, stop: stopSpeaking, toggle, speaking, currentMessageId } = useTextToSpeech({
        onError: (err) => setError(err),
        rate: 1,
        pitch: 1,
    });

    const handleSendMessage = useCallback(async (text: string) => {
        if (!text.trim() && files.length === 0) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text || "[Audio/File Input]",
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("prompt", text);
            formData.append("session_history", JSON.stringify(
                messages.map((m) => ({ role: m.role, content: m.content }))
            ));

            files.forEach((file) => {
                formData.append("files", file);
            });

            const response = await microserviceApi.post("/generate-chat", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                //@ts-ignore
                content: response.data.response || "I couldn't process that request.",
            };

            setMessages((prev) => [...prev, assistantMessage]);
            clearFiles();

            // Auto-speak (note: some browsers may require a prior user gesture)
            if (autoSpeak) {
                setTimeout(() => speak(assistantMessage.content, assistantMessage.id), 200);
            }
        } catch (err: any) {
            setError(err.message || "Failed to get response");
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    }, [files, messages, clearFiles, speak, autoSpeak]);

    const { start: startListening, active: isRecording, supported: speechSupported } = useSpeechRecognition({
        onResult: (text) => {
            setIsListening(false);
            handleSendMessage(text);
        },
        onError: (msg) => {
            setIsListening(false);
            setError(msg);
        },
    });

    const handleMicClick = useCallback(async () => {
        if (isRecording) return;

        setIsListening(true);
        startListening();
    }, [isRecording, startListening]);

    const handleTextSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (textInput.trim()) {
            handleSendMessage(textInput);
            setTextInput("");
        }
    }, [textInput, handleSendMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const orbHue = isListening || isRecording ? 120 : isProcessing ? 60 : 220;
    const forceHover = isListening || isRecording || isProcessing || speaking;

    return (
        <main className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Smart<span className="text-green-500">Saarthi</span>
                </h1>
                <p className="text-slate-400 text-sm md:text-base">
                    Your multilingual AI voice assistant
                </p>
                {/* Auto-speak toggle */}
                <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`mt-2 text-xs px-3 py-1 rounded-full transition-colors ${
                        autoSpeak 
                            ? "bg-green-600 text-white" 
                            : "bg-slate-700 text-slate-400"
                    }`}
                >
                    {autoSpeak ? "Auto-speak: ON" : "Auto-speak: OFF"}
                </button>
            </div>

            {/* Main Container */}
            <div className="w-full max-w-4xl flex flex-col items-center gap-6">
                {/* Orb Container */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                    <Orb
                        hue={orbHue}
                        hoverIntensity={0.5}
                        rotateOnHover
                        forceHoverState={forceHover}
                        backgroundColor="#0f172a"
                    />
                    
                    {/* Status Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {isListening && (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-green-400 text-sm font-medium">Listening...</span>
                            </div>
                        )}
                        {isProcessing && (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                                <span className="text-yellow-400 text-sm font-medium">Processing...</span>
                            </div>
                        )}
                        {speaking && !isProcessing && (
                            <div className="flex flex-col items-center gap-2">
                                <Volume2 className="w-8 h-8 text-blue-400 animate-pulse" />
                                <span className="text-blue-400 text-sm font-medium">Speaking...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Display */}
                {messages.length > 0 && (
                    <div className="w-full max-h-48 overflow-y-auto bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm border border-slate-700">
                        <div className="space-y-3">
                            {messages.slice(-4).map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                                            msg.role === "user"
                                                ? "bg-blue-600 text-white rounded-br-md"
                                                : "bg-slate-700 text-slate-200 rounded-bl-md"
                                        }`}
                                    >
                                        <p>{msg.content}</p>
                                        {msg.role === "assistant" && (
                                            <button
                                                onClick={() => toggle(msg.content, msg.id)}
                                                className="mt-2 text-xs text-slate-400 hover:text-green-400 flex items-center gap-1"
                                            >
                                                {speaking && currentMessageId === msg.id ? (
                                                    <>
                                                        <VolumeX className="w-3 h-3" /> Stop
                                                    </>
                                                ) : (
                                                    <>
                                                        <Volume2 className="w-3 h-3" /> Play
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="w-full bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
                        {error}
                        <button onClick={() => setError(null)} className="ml-2 underline">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* File Attachments */}
                {files.length > 0 && (
                    <div className="w-full flex flex-wrap gap-2 justify-center">
                        {files.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-full text-sm text-slate-300"
                            >
                                <Paperclip className="w-3 h-3" />
                                <span className="max-w-[120px] truncate">{file.name}</span>
                                <button
                                    onClick={() => removeAt(idx)}
                                    className="text-slate-400 hover:text-red-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-col items-center gap-4 w-full max-w-md">
                    {/* Voice Button */}
                    <button
                        onClick={handleMicClick}
                        disabled={!speechSupported || isProcessing || isRecording}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                            isListening || isRecording
                                ? "bg-green-500 hover:bg-green-600 scale-110"
                                : isProcessing
                                ? "bg-slate-600 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                        }`}
                    >
                        {isListening || isRecording ? (
                            <Mic className="w-8 h-8 text-white animate-pulse" />
                        ) : (
                            <MicOff className="w-8 h-8 text-white" />
                        )}
                    </button>

                    <p className="text-slate-400 text-sm">
                        {!speechSupported
                            ? "Speech not supported in this browser"
                            : isListening
                            ? "Speak now..."
                            : "Tap to speak"}
                    </p>

                    {/* Text Input + File Attach */}
                    <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2">
                        <button
                            type="button"
                            onClick={triggerFileSelect}
                            className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300 transition-colors"
                            title="Attach file"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <input {...inputProps} />

                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Or type your message..."
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-full px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isProcessing}
                        />

                        <button
                            type="submit"
                            disabled={isProcessing || (!textInput.trim() && files.length === 0)}
                            className="p-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-full text-white transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                {/* Language Hint */}
                <p className="text-slate-500 text-xs text-center mt-4">
                    Supports Hindi & English • Driver & Rider Support
                </p>
            </div>
        </main>
    );
}