"use client";
import { useRef, useState, useCallback } from "react";

export function useFileSelection(accept?: string) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);

    const trigger = useCallback(() => fileInputRef.current?.click(), []);
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setFiles(Array.from(e.target.files));
        }
    }, []);
    const clearAll = useCallback(() => setFiles([]), []);
    const removeAt = useCallback((idx: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    }, []);

    const inputProps = {
        ref: fileInputRef,
        type: "file",
        className: "hidden",
        accept,
        multiple: true,
        onChange,
    };

    return { files, trigger, clearAll, removeAt, inputProps };
}