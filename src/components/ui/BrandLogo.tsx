import React from "react";

interface BrandLogoProps {
  size?: number;
}

/**
 * Safari-safe inline SVG lotus-and-garden emblem for Soun Kanit (សួនគណិត).
 */
export function BrandLogo({ size = 38 }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0 -rotate-3 rounded-2xl ring-2 ring-white shadow-[0_4px_0_#14532d] transition-transform duration-150 hover:rotate-0"
    >
      <rect width={64} height={64} rx={16} fill="#15803d" />
      <rect x={5} y={5} width={54} height={54} rx={13} fill="#fff9e6" />
      <ellipse
        cx={32}
        cy={46}
        rx={20}
        ry={6.5}
        fill="#22c55e"
        stroke="#15803d"
        strokeWidth={2}
      />
      <ellipse
        cx={22}
        cy={33}
        rx={6.8}
        ry={11.5}
        transform="rotate(-28 22 33)"
        fill="#f472b6"
        stroke="#9d174d"
        strokeWidth={1.8}
      />
      <ellipse
        cx={42}
        cy={33}
        rx={6.8}
        ry={11.5}
        transform="rotate(28 42 33)"
        fill="#f472b6"
        stroke="#9d174d"
        strokeWidth={1.8}
      />
      <ellipse
        cx={32}
        cy={29}
        rx={7.2}
        ry={13.5}
        fill="#fbcfe8"
        stroke="#9d174d"
        strokeWidth={1.8}
      />
      <circle
        cx={32}
        cy={36}
        r={4.2}
        fill="#ffd23f"
        stroke="#b45309"
        strokeWidth={1.5}
      />
    </svg>
  );
}
