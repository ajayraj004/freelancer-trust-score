import React from 'react';

const TrustGauge = ({ score, size = 120, strokeWidth = 10, showText = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const getColor = (s) => {
    if (s >= 90) return '#10b981'; // Success Green
    if (s >= 70) return '#6366f1'; // Primary Indigo
    if (s >= 50) return '#f59e0b'; // Warning Yellow
    return '#f43f5e'; // Danger Rose
  };

  const currentColor = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center relative score-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={currentColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${currentColor}44)`
          }}
        />
      </svg>
      {showText && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-outfit" style={{ color: currentColor }}>
            {score}
          </span>
        </div>
      )}
    </div>
  );
};

export default TrustGauge;
