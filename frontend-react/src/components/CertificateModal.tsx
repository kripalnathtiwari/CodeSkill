import React, { useRef } from "react";
import { X, Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface CertificateModalProps {
  studentName: string;
  courseName: string;
  certificateId: string;
  templateImage?: string;
  onClose: () => void;
}

export default function CertificateModal({ studentName, courseName, certificateId, templateImage, onClose }: CertificateModalProps) {

  // Provide a way to print/download the certificate (browser print for now)
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-[#f8f9fa] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
      >
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between no-print">
          <h3 className="font-bold text-slate-800 text-lg">Your Certificate</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md flex items-center transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Rendering Area */}
        <div className="p-8 md:p-12 bg-slate-100 flex items-center justify-center overflow-auto print:p-0 print:m-0 print:w-full print:h-screen">

          {/* Certificate Container with fixed aspect ratio */}
          <div className="relative w-full max-w-[1000px] shadow-[0_0_40px_rgba(0,0,0,0.1)] print:shadow-none bg-white overflow-hidden" style={{ aspectRatio: '1.414 / 1' }}>

            {/* Background Image */}
            <img
              src={templateImage || "/images/certificate.png"}
              alt="Certificate Background"
              loading="lazy"
              className="w-full h-full object-cover"
            />

            {/* OVERLAYS: Covering the baked-in text and writing the dynamic text */}

            {/* 1. Student Name Overlay */}
            {/* These percentages are approximate based on standard certificate layouts to cover the center area */}
            <div className={`absolute ${templateImage ? 'top-[44%]' : 'top-[48%]'} left-[10%] right-[10%] h-[12%] flex items-center justify-center ${templateImage ? 'bg-transparent' : 'bg-white'}`}>
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a202c] tracking-wide ${templateImage ? 'bg-white px-8 py-2 rounded-xl' : ''}`} style={{ fontFamily: '"Playfair Display", serif' }}>
                {studentName}
              </h1>
            </div>

            {/* 2. Course Name Overlay (Made taller to cover any baked-in subtitle text) */}
            <div className={`absolute ${templateImage ? 'top-[58%]' : 'top-[72%]'} left-[10%] right-[10%] h-[18%] flex items-center justify-center ${templateImage ? 'bg-transparent' : 'bg-white'}`}>
              <h2 className={`text-xl md:text-2xl lg:text-3xl font-bold text-[#1a202c] tracking-[0.1em] text-center px-4 ${templateImage ? 'bg-white py-2 rounded-xl' : ''}`} style={{ fontFamily: '"Playfair Display", serif' }}>
                {courseName.toUpperCase()}
              </h2>
            </div>

            {/* 3. Certificate ID Overlay (Bottom Left) */}
            <div className="absolute bottom-[5%] left-[8%] text-left">
              <p className={`text-xs md:text-sm text-slate-500 font-mono tracking-widest px-2 py-1 rounded ${templateImage ? 'bg-transparent' : 'bg-white/80'}`}>
                ID: {certificateId}
              </p>
            </div>

          </div>
        </div>

      </motion.div>

      {/* Print-only styles to ensure the certificate prints perfectly landscape */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:m-0 {
            margin: 0 !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:h-screen {
            height: 100vh !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .fixed.inset-0 {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          .w-full.max-w-5xl {
            max-width: none !important;
            border-radius: 0 !important;
          }
          .relative.w-full.max-w-\\[1000px\\] {
            max-width: none !important;
          }
          .relative.w-full.max-w-\\[1000px\\] > * {
            visibility: visible;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
