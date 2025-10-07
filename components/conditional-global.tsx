"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function ConditionalGlobal() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return null;
  }

  return (
    <>
      <Footer />
      {/* Floating WhatsApp Chat Button */}
      <a
        href="https://wa.me/255763652641"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
      >
        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7"
          aria-hidden="true"
        >
          <path d="M20.52 3.48A11.93 11.93 0 0 0 12.05 0C5.48 0 .18 5.31.18 11.88c0 2.09.56 4.13 1.63 5.92L0 24l6.35-1.66a11.86 11.86 0 0 0 5.69 1.46h.01c6.57 0 11.87-5.31 11.87-11.88 0-3.17-1.23-6.15-3.41-8.36ZM12.05 21.33h-.01a9.45 9.45 0 0 1-4.82-1.31l-.35-.2-3.77 1 1.01-3.67-.23-.38A9.5 9.5 0 1 1 21.55 11.9c0 5.25-4.27 9.43-9.5 9.43Zm5.21-7.05c-.29-.15-1.71-.84-1.98-.94-.27-.1-.46-.15-.65.15s-.75.94-.92 1.13-.34.21-.63.07c-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.34.42-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.08-.15-.65-1.57-.89-2.15-.23-.56-.47-.49-.65-.49h-.56c-.19 0-.49.07-.75.36s-.98.96-.98 2.34 1.01 2.72 1.15 2.92c.15.21 1.99 3.04 4.82 4.13.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.33Z"/>
        </svg>
        <span className="sr-only">WhatsApp</span>
      </a>
    </>
  );
}