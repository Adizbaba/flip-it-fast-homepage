
import { Gavel } from "lucide-react";
import React from "react";

interface FastFlipLogoProps {
  size?: number;
  textSize?: string;
  withText?: boolean;
  className?: string;
}

const FastFlipLogo: React.FC<FastFlipLogoProps> = ({
  size = 32,
  textSize = "text-xl",
  withText = true,
  className = "",
}) => {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative">
        {/* Glowing background */}
        <span
          aria-hidden
          className="absolute -inset-1 rounded-full blur-md opacity-60"
          style={{
            background: "linear-gradient(135deg, #775BFF88 60%, #FFA02566 100%)",
            zIndex: 0,
          }}
        />
        <Gavel
          size={size}
          color="#775BFF"
          style={{
            filter: "drop-shadow(0 0 8px #775bff88)",
            zIndex: 1,
            position: "relative",
          }}
        />
        {/* Orange accent "flip" arrow (styled as a small rotated chevron) */}
        <svg
          aria-hidden
          width={size / 2.5}
          height={size / 2.5}
          viewBox="0 0 20 20"
          className="absolute"
          style={{
            left: size * 0.57,
            top: size * 0.45,
            transform: "rotate(-45deg)",
            zIndex: 2,
          }}
        >
          <path
            d="M2 10h12M12 10l-4-4M12 10l-4 4"
            stroke="#FFA025"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="drop-shadow(0 0 8px #ffa02588)"
          />
        </svg>
      </span>
      {withText && (
        <span
          className={`font-extrabold ${textSize} tracking-tight ml-1`}
          style={{
            color: "#775BFF",
            textShadow: "0 0 8px #775bff44",
          }}
        >
          Fast
          <span style={{ color: "#FFA025", textShadow: "0 0 4px #ffa025" }}>
            Flip
          </span>
        </span>
      )}
    </span>
  );
};

export default FastFlipLogo;
