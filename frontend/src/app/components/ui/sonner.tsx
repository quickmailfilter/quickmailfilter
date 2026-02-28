"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-slate-500",
          actionButton: "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
          success: "group-[.toaster]:bg-white group-[.toaster]:text-[#1E3A8A] group-[.toaster]:border-[#2563EB] group-[.toaster]:border-l-4",
          error: "group-[.toaster]:bg-white group-[.toaster]:text-[#991B1B] group-[.toaster]:border-[#EF4444] group-[.toaster]:border-l-4",
          info: "group-[.toaster]:bg-white group-[.toaster]:text-[#1E3A8A] group-[.toaster]:border-[#2563EB] group-[.toaster]:border-l-4",
          warning: "group-[.toaster]:bg-white group-[.toaster]:text-[#92400E] group-[.toaster]:border-[#F59E0B] group-[.toaster]:border-l-4",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
