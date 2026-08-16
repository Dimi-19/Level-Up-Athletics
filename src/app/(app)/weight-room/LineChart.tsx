"use client";

import { useRef, useState, type MouseEvent } from "react";

export interface LineChartPoint {
  date: string;
  value: number;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function LineChart({
  data,
  color = "#10b981",
  unit = "",
  height = 160,
}: {
  data: LineChartPoint[];
  color?: string;
  unit?: string;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">No entries logged yet.</p>;
  }

  const width = 600;
  const padding = { top: 20, right: 16, bottom: 24, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const range = rawMax - rawMin || 1;
  const min = rawMin - range * 0.15;
  const max = rawMax + range * 0.15;

  const xFor = (i: number) =>
    data.length === 1 ? padding.left + innerWidth / 2 : padding.left + (i / (data.length - 1)) * innerWidth;
  const yFor = (v: number) => padding.top + innerHeight - ((v - min) / (max - min)) * innerHeight;

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)},${yFor(d.value).toFixed(1)}`).join(" ");
  const format = (v: number) => `${Math.round(v * 10) / 10}${unit}`;

  function handleMove(e: MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const svgX = relX * width;

    let nearest = 0;
    let nearestDist = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(xFor(i) - svgX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const lastIndex = data.length - 1;
  const activeIndex = hoverIndex ?? lastIndex;
  const active = data[activeIndex];
  const tooltipX = Math.min(Math.max(xFor(activeIndex), padding.left), width - padding.right - 90);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full touch-none"
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIndex(null)}
      role="img"
      aria-label={`Line chart, latest value ${format(active.value)} on ${formatDate(active.date)}`}
    >
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="#27272a"
        strokeWidth={1}
      />
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="#27272a"
        strokeWidth={1}
      />

      <text x={padding.left - 6} y={padding.top + 4} textAnchor="end" className="fill-zinc-600 text-[9px]">
        {format(max - range * 0.15)}
      </text>
      <text x={padding.left - 6} y={height - padding.bottom} textAnchor="end" className="fill-zinc-600 text-[9px]">
        {format(min + range * 0.15)}
      </text>

      <text x={padding.left} y={height - 4} textAnchor="start" className="fill-zinc-600 text-[9px]">
        {formatDate(data[0].date)}
      </text>
      <text x={width - padding.right} y={height - 4} textAnchor="end" className="fill-zinc-600 text-[9px]">
        {formatDate(data[lastIndex].date)}
      </text>

      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {data.map((d, i) => (
        <circle key={d.date} cx={xFor(i)} cy={yFor(d.value)} r={i === activeIndex ? 4 : 2.5} fill={color} />
      ))}

      {hoverIndex !== null && (
        <line
          x1={xFor(hoverIndex)}
          y1={padding.top}
          x2={xFor(hoverIndex)}
          y2={height - padding.bottom}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.5}
        />
      )}

      <g transform={`translate(${tooltipX}, 2)`}>
        <rect width={90} height={18} rx={4} className="fill-zinc-900" stroke="#3f3f46" strokeWidth={1} />
        <text x={6} y={13} className="fill-zinc-200 text-[10px]">
          {formatDate(active.date)} · {format(active.value)}
        </text>
      </g>
    </svg>
  );
}
