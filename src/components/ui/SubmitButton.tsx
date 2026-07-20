"use client";

import { useFormStatus } from "react-dom";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

type Props = { children: React.ReactNode; loadingText?: string; variant?: "primary" | "secondary"; className?: string };

export default function SubmitButton({ children, loadingText, variant = "primary", className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending}
      className={clsx("flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "primary" && "bg-purple-700 text-white hover:bg-purple-800",
        variant === "secondary" && "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        className)}>
      {pending ? (<><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /><span>{loadingText ?? "A processar..."}</span></>) : children}
    </button>
  );
}
