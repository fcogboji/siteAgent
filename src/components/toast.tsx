"use client";

import { useEffect, useRef, useState } from "react";

export function Toaster() {
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleToast(e: Event) {
      const message = (e as CustomEvent<{ message: string }>).detail?.message ?? "Done!";
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      setToast({ message });
      timeoutRef.current = setTimeout(() => setToast(null), 2500);
    }
    window.addEventListener("toast", handleToast);
    return () => {
      window.removeEventListener("toast", handleToast);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-toast-in rounded-xl bg-stone-900 px-6 py-3 text-sm font-medium text-white shadow-lg"
    >
      {toast.message}
    </div>
  );
}

export function showToast(message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("toast", { detail: { message } }));
  }
}
