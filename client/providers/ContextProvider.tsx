"use client";

import AuthProvider from "./AuthProvider";
import { ToastProvider } from "./ToastProvider";

export default function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  );
}