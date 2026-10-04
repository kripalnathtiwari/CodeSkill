import React from "react";
import { motion } from "framer-motion";

export default function PlatformIllustration() {
  const satellites = [
    { name: "SQL", color: "bg-emerald-500", text: "text-white" },
    { name: "rs", color: "bg-blue-600", text: "text-white" },
    { name: "GO", color: "bg-cyan-600", text: "text-white" },
    { name: "PY", color: "bg-blue-500", text: "text-white" },
    { name: "JS", color: "bg-yellow-400", text: "text-slate-900" },
    { name: "JAVA", color: "bg-red-500", text: "text-white" },
    { name: "C++", color: "bg-indigo-500", text: "text-white" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
      <img
        src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789446916/ChatGPT_Image_Sep_10_2026_11_55_38_AM.png"
        alt="Platform Illustration"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
