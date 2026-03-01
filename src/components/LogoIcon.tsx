export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="35" cy="35" r="35" fill="#33E692" />
      {/* Edges connecting nodes */}
      <line x1="35" y1="25" x2="20" y2="45" stroke="white" strokeWidth="2.7" strokeLinecap="round" />
      <line x1="35" y1="25" x2="50" y2="45" stroke="white" strokeWidth="2.7" strokeLinecap="round" />
      {/* Nodes — top center, bottom-left, bottom-right */}
      <circle cx="35" cy="25" r="5.7" fill="white" />
      <circle cx="20" cy="45" r="5.7" fill="white" />
      <circle cx="50" cy="45" r="5.7" fill="white" />
    </svg>
  );
}
