import React, { useState, useEffect } from "react";

// Mark as client component for Next.js
("use client");

const DotBackground = ({ children }) => {
  const [dots, setDots] = useState([]);

  // Calculate dots with a cap to prevent performance issues
  const calculateDots = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const maxDots = 1000; // Cap to prevent excessive DOM elements
    const dotsPerRow = Math.min(Math.ceil(width / 20), 50); // Adjust spacing (20px) and cap
    const dotsPerColumn = Math.min(Math.ceil(height / 20), 50);
    const totalDots = Math.min(dotsPerRow * dotsPerColumn, maxDots);
    return Array.from({ length: totalDots }, (_, i) => i); // Use index as value for unique keys
  };

  // Update dots on mount and resize
  useEffect(() => {
    const updateDots = () => {
      const newDots = calculateDots();
      setDots(newDots);
    };

    updateDots(); // Initial calculation
    window.addEventListener("resize", updateDots);

    // Cleanup to prevent memory leaks
    return () => {
      window.removeEventListener("resize", updateDots);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Dot Grid Background */}
      <div
        className="absolute inset-0 grid pointer-events-none z-0"
        style={{
          gridTemplateColumns: `repeat(${Math.min(
            Math.ceil(window.innerWidth / 20),
            50
          )}, 4px)`,
          gridTemplateRows: `repeat(${Math.min(
            Math.ceil(window.innerHeight / 20),
            50
          )}, 4px)`,
          gridGap: "9px",
        }}
      >
        {dots.map((index) => (
          <div key={index} className="w-1 h-1 bg-white/10 rounded-full" />
        ))}
      </div>

      {/* Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default DotBackground;
