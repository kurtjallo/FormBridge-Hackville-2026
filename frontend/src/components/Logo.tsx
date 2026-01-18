import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  sm: 'w-8 h-8',   // 32px
  md: 'w-10 h-10', // 40px
  lg: 'w-12 h-12', // 48px
  xl: 'w-20 h-20', // 64px
  '2xl': 'w-24 h-24' // 96px
};

export function Logo({ 
  className = "", 
  showText = true, 
  textClassName = "font-bold text-xl tracking-tighter text-gray-900",
  size = 'md'
}: LogoProps) {
  return (
    <Link 
      href="/" 
      className={`flex items-center gap-0.5 transition-all duration-200 hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-lg ${className}`}
      aria-label="Clarify Homepage"
    >
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <Image 
          src="/logo.png" 
          alt="Clarify Logo" 
          fill
          priority
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      {showText && (
        <span className={textClassName}>
          Clarify
        </span>
      )}
    </Link>
  );
}
