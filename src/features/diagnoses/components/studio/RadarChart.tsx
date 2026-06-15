// src/features/diagnoses/components/studio/RadarChart.tsx
'use client';

import { useEffect, useState } from 'react';

interface RadarChartProps {
  metrics: {
    label: string;
    value: number;
  }[];
}

export function RadarChart({ metrics }: RadarChartProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const size = 260;
  const cx = size / 2;
  const cy = size / 2 - 5;
  const rMax = 80;
  const numPoints = metrics.length;

  // Calculate coordinates helper
  function getCoordinates(index: number, value: number, maxRadius: number) {
    // 0 is straight up (-90 degrees)
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numPoints;
    const x = cx + maxRadius * (value / 10) * Math.cos(angle);
    const y = cy + maxRadius * (value / 10) * Math.sin(angle);
    return { x, y };
  }

  // Grid levels (e.g. 2, 4, 6, 8, 10 scores)
  const gridLevels = [2, 4, 6, 8, 10];

  // Draw grid concentric pentagons
  const gridPolygons = gridLevels.map(level => {
    const points = Array.from({ length: numPoints }, (_, i) => {
      const { x, y } = getCoordinates(i, level, rMax);
      return `${x},${y}`;
    }).join(' ');
    return points;
  });

  // Calculate coordinates for dynamic data points
  const dataPoints = metrics.map((m, i) => {
    // If not animated yet, start from center (0) to create a growth transition
    const val = animate ? m.value : 0;
    return getCoordinates(i, val, rMax);
  });

  const dataPathString = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Labels positioning
  const labelDistanceOffset = 18;
  const labels = metrics.map((m, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numPoints;
    const lx = cx + (rMax + labelDistanceOffset) * Math.cos(angle);
    const ly = cy + (rMax + labelDistanceOffset) * Math.sin(angle);
    
    // Adjust text alignment anchor based on position
    let textAnchor: 'middle' | 'start' | 'end' = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    if (Math.cos(angle) < -0.1) textAnchor = 'end';

    // Fine-tune vertical offset
    let dy = '0.33em';
    if (Math.sin(angle) < -0.9) dy = '-0.2em';
    if (Math.sin(angle) > 0.9) dy = '0.8em';

    return { label: m.label, x: lx, y: ly, textAnchor, dy };
  });

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 self-start pl-2">
        Radar Profil Analizi
      </h4>
      <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {/* Grid lines (pentagons) */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="transparent"
              stroke="#221e33"
              strokeWidth="1"
            />
          ))}

          {/* Grid axes (lines radiating from center) */}
          {Array.from({ length: numPoints }).map((_, i) => {
            const { x, y } = getCoordinates(i, 10, rMax);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="#1b192c"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Dynamic data polygon */}
          <polygon
            points={dataPathString}
            fill="rgba(232, 28, 255, 0.12)"
            stroke="rgb(232, 28, 255)"
            strokeWidth="2.5"
            className="transition-all duration-[1200ms] ease-out shadow-[0_0_10px_rgba(232,28,255,0.4)]"
          />

          {/* Data points dots */}
          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="rgb(232, 28, 255)"
              stroke="#141221"
              strokeWidth="1.5"
              className="transition-all duration-[1200ms] ease-out cursor-pointer hover:scale-150"
            />
          ))}

          {/* Metric labels */}
          {labels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={l.y}
              textAnchor={l.textAnchor}
              dy={l.dy}
              className="text-[9px] font-semibold text-gray-500 fill-current select-none"
            >
              {l.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
