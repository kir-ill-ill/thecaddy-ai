'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 128,
} as const;

function LogoIcon({ size = 32 }: { size?: number }) {
  // Scale factor relative to a 32px base design
  const s = size / 32;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Golf ball at the base */}
      <circle cx="16" cy="28" r={3} fill="#E8E5CC" stroke="#D4AF37" strokeWidth={0.8} />
      {/* Dimple details on the ball */}
      <circle cx="15" cy="27.2" r={0.5} fill="#D4D0B8" />
      <circle cx="17" cy="27.8" r={0.4} fill="#D4D0B8" />
      <circle cx="15.8" cy="28.8" r={0.45} fill="#D4D0B8" />

      {/* Pole */}
      <line
        x1="16"
        y1="25"
        x2="16"
        y2="4"
        stroke="#D4AF37"
        strokeWidth={1.4}
        strokeLinecap="round"
      />

      {/* Flag with a slight wave/flutter */}
      <path
        d="M16 4 L16 14 Q20 13.2 22 11 Q24 8.8 26 9 Q24.5 7.5 22.5 6.5 Q20 5.2 16 4Z"
        fill="#1A4D2E"
      />
      {/* Subtle highlight on the flag for depth */}
      <path
        d="M16 5.5 L16 7 Q19 6.5 21 7.5 Q19.5 6 16 5.5Z"
        fill="#2A6B42"
        opacity={0.6}
      />
    </svg>
  );
}

export default function Logo({ size = 'md', showText = false, className = '' }: LogoProps) {
  const px = sizes[size];

  // Scale text size relative to icon size
  const textSizeClass =
    size === 'xl' ? 'text-4xl' :
    size === 'lg' ? 'text-2xl' :
    size === 'md' ? 'text-xl' :
    'text-base';

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoIcon size={px} />
      {showText && (
        <span className={`font-display ${textSizeClass} leading-none`}>
          <span className="font-normal">The</span>
          <span className="font-bold">Caddy</span>
          <span className="text-gold">.ai</span>
        </span>
      )}
    </span>
  );
}

export { LogoIcon };
