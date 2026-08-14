import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

export function extractDriveId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:\/file\/d\/|\/d\/|[?&]id=)([-a-zA-Z0-9_]{20,})/);
  return match ? match[1] : null;
}

interface DriveImageProps {
  sample: {
    imageUrl?: string | null;
    fileUrl?: string | null;
    title?: string | null;
    category?: string | null;
  };
  apiUrl: string;
  className?: string;
  alt?: string;
}

export default function DriveImage({
  sample,
  apiUrl,
  className = 'w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-500',
  alt,
}: DriveImageProps) {
  const [index, setIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIndex(0);
    setHasError(false);
  }, [sample.imageUrl, sample.fileUrl]);

  const rawUrl = sample.imageUrl || sample.fileUrl;
  const driveId = extractDriveId(rawUrl);

  const candidates: string[] = [];
  if (driveId) {
    // Priority 1: Google Drive thumbnail API (supports images, PDFs, and docs up to 1000px wide)
    candidates.push(`https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`);
    // Priority 2: Direct image stream
    candidates.push(`https://drive.google.com/uc?export=view&id=${driveId}`);
    // Priority 3: Google Drive CDN cache
    candidates.push(`https://lh3.googleusercontent.com/d/${driveId}=w1000?authuser=0`);
  } else if (rawUrl) {
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      candidates.push(rawUrl);
    } else {
      const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
      candidates.push(`${apiUrl}/public${cleanPath}`);
    }
  }

  const currentUrl = candidates[index];

  if (!currentUrl || hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center border border-border relative overflow-hidden group/doc p-4">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl" />
        <div className="w-16 h-20 bg-slate-800 border-2 border-primary/40 rounded-lg p-2.5 shadow-xl flex flex-col justify-between mb-3 group-hover/doc:-translate-y-1 transition-transform">
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-primary rounded-full" />
            <div className="w-3/4 h-1 bg-slate-600 rounded-full" />
            <div className="w-full h-1 bg-slate-700 rounded-full" />
            <div className="w-5/6 h-1 bg-slate-700 rounded-full" />
          </div>
          <div className="w-1/2 h-1 bg-primary/60 rounded-full" />
        </div>
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider text-center line-clamp-1">
          {sample?.category || 'Professional CV'}
        </span>
        <span className="text-[10px] text-text-muted mt-1 font-medium text-center line-clamp-1">
          {sample?.title || 'CV Sample Document'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={alt || sample?.title || 'CV Template'}
      className={className}
      onError={() => {
        if (index + 1 < candidates.length) {
          setIndex(index + 1);
        } else {
          setHasError(true);
        }
      }}
    />
  );
}
