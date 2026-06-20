import type { ReactNode } from "react";

interface AircraftOutlineProps {
  children?: ReactNode;
  faded?: boolean;
}

const AircraftOutline = ({ children, faded = false }: AircraftOutlineProps) => (
  <div className={`aircraft-outline ${faded ? "faded" : ""}`}>
    <svg viewBox="0 0 460 920" className="outline-svg" aria-hidden="true">
      <defs>
        <linearGradient id="ramLiveryFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(194,0,47,0.04)" />
          <stop offset="100%" stopColor="rgba(0,92,46,0.04)" />
        </linearGradient>
      </defs>
      <path
        d="M230 20 L255 60 L275 140 L285 250 L370 330 L365 365 L292 340 L290 680 L330 765 L300 770 L270 710 L190 710 L160 770 L130 765 L170 680 L168 340 L95 365 L90 330 L175 250 L185 140 L205 60 Z"
        fill="url(#ramLiveryFill)"
        stroke="var(--ram-crimson)"
        strokeOpacity="0.6"
        strokeWidth="1"
      />
      <ellipse cx="145" cy="344" rx="18" ry="9" fill="none" stroke="var(--ram-crimson)" strokeOpacity="0.45" />
      <ellipse cx="315" cy="344" rx="18" ry="9" fill="none" stroke="var(--ram-crimson)" strokeOpacity="0.45" />
    </svg>
    <div className="outline-content">{children}</div>
  </div>
);

export default AircraftOutline;
