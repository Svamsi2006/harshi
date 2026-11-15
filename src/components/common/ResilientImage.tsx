import React, { useState } from 'react';
import { Palette } from 'lucide-react';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F8EFEA] to-[#E7C7CC] text-[#7A655C] p-4 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackTitle || 'Handcrafted artwork'}
      >
        <Palette className="w-7 h-7 text-[#6D1836] mb-2 opacity-80" strokeWidth={1.5} />
        <span className="font-display text-sm text-[#3E2F27] line-clamp-2">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
};
