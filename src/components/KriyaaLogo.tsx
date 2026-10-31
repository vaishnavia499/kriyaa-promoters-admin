import React from 'react';

interface KriyaaLogoProps {
  className?: string;
}

export const KriyaaLogo: React.FC<KriyaaLogoProps> = ({ className = 'w-full h-full' }) => {
  return (
    <img
      src="/kriyaa-logo.jpg"
      alt="Kriyaa Promoters Logo"
      className={`${className} object-contain`}
      draggable={false}
    />
  );
};
