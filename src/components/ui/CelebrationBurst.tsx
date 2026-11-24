"use client";

import React from "react";
import { m, AnimatePresence } from "motion/react";

interface CelebrationBurstProps {
  active: boolean;
}

const PETALS = [
  { id: 1, x: -72, y: -38, color: "#f472b6", rotate: -25 },
  { id: 2, x: -34, y: -56, color: "#f59e0b", rotate: 18 },
  { id: 3, x: 0, y: -64, color: "#22c55e", rotate: 0 },
  { id: 4, x: 36, y: -54, color: "#3b82f6", rotate: -18 },
  { id: 5, x: 72, y: -36, color: "#f472b6", rotate: 28 },
  { id: 6, x: -50, y: -14, color: "#facc15", rotate: -40 },
  { id: 7, x: 52, y: -16, color: "#facc15", rotate: 40 },
];

/**
 * Calm lotus-petal & star celebration burst using LazyMotion `m`
 * and pure SVG petals (respects prefers-reduced-motion).
 */
export function CelebrationBurst({ active }: CelebrationBurstProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-0 w-full flex justify-center overflow-visible"
    >
      <AnimatePresence>
        {active &&
          PETALS.map((petal) => (
            <m.svg
              key={petal.id}
              viewBox="0 0 20 20"
              width={18}
              height={18}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: petal.x,
                y: petal.y,
                scale: [0.5, 1.1, 0.8],
                rotate: petal.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute"
            >
              <ellipse
                cx={10}
                cy={10}
                rx={5}
                ry={8}
                fill={petal.color}
              />
            </m.svg>
          ))}
      </AnimatePresence>
    </div>
  );
}
