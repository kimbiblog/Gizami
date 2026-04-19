export default function LogoSVG({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 400 110" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <g fill="#375d41">
        {/* 'G' */}
        <path d="M72.5 56.4V43.2H42.7v24H72.4c-1 12.3-10.8 21.6-23.7 21.6-13.4 0-24.3-11-24.3-24.6 0-13.6 10.9-24.6 24.3-24.6 7 0 13.3 2.9 17.5 7.6l9.3-9.5A37.3 37.3 0 0048.7 15c-20.7 0-37.5 17-37.5 38s16.8 38 37.5 38c19.8 0 36.2-15.5 37.5-34.6z" />
        
        {/* '!' part 1 as I */}
        <rect x="90" y="16" width="12" height="52" />
        {/* The dot is orange */}
        <rect x="90" y="78" width="12" height="12" fill="#ff8c00" />
        
        {/* 'Z' */}
        <path d="M120 16h42v12l-28 40h30v12h-44v-12l28-40h-28z" />
        
        {/* 'A' */}
        {/* The top shape is an orange triangle shape, the bottom is a green bar */}
        <path d="M195 16l18 42h-8.5l-9.5-22.2-9.5 22.2h-8.5l18-42z" fill="#ff8c00" stroke="#ff8c00" strokeWidth="6" strokeLinejoin="round" />
        {/* Green bar at base of A */}
        <rect x="175" y="77" width="40" height="13" />

        {/* 'M' */}
        <path d="M235 16h13l13 36 13-36h13v74h-12V43.6L261.6 82h-1.2L247 43.6V90h-12z" />
        
        {/* '!' part 2 as I */}
        <path d="M312 16h12v45h-12z" />
        {/* The last orange underline/dot */}
        <rect x="312" y="77" width="30" height="13" fill="#ff8c00" />
      </g>
    </svg>
  );
}
