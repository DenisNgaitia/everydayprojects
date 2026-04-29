/**
 * BalanceChart.jsx
 * Pure SVG area sparkline — zero external dependencies.
 * Draws balance trajectory as expenses are added, with a gradient fill,
 * animated stroke draw, and a hover tooltip per data point.
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const W = 600;   // viewBox width
const H = 180;   // viewBox height
const PAD = { top: 16, right: 20, bottom: 32, left: 54 };

function lerp(value, inMin, inMax, outMin, outMax) {
    if (inMax === inMin) return (outMin + outMax) / 2;
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

function buildPath(points) {
    if (points.length === 0) return '';
    return points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ');
}

function buildAreaPath(points, yBottom) {
    if (points.length === 0) return '';
    const line = buildPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    return `${line} L ${last.x.toFixed(2)} ${yBottom} L ${first.x.toFixed(2)} ${yBottom} Z`;
}

export default function BalanceChart({ balanceHistory }) {
    const [tooltip, setTooltip] = useState(null);
    const svgRef = useRef(null);

    if (!balanceHistory || balanceHistory.length < 2) {
        return (
            <div
                className="flex items-center justify-center rounded-2xl"
                style={{ height: '180px', background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px' }}
            >
                Log expenses to see your balance trajectory.
            </div>
        );
    }

    const values = balanceHistory.map(d => d.balance);
    const minVal = 0;
    const maxVal = Math.max(...values) * 1.08 || 1;

    const chartLeft = PAD.left;
    const chartRight = W - PAD.right;
    const chartTop = PAD.top;
    const chartBottom = H - PAD.bottom;

    const points = balanceHistory.map((d, i) => ({
        x: lerp(i, 0, balanceHistory.length - 1, chartLeft, chartRight),
        y: lerp(d.balance, minVal, maxVal, chartBottom, chartTop),
        label: d.label,
        balance: d.balance,
    }));

    const linePath = buildPath(points);
    const areaPath = buildAreaPath(points, chartBottom);

    // Y-axis ticks
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
        value: Math.round(minVal + t * (maxVal - minVal)),
        y: lerp(t, 0, 1, chartBottom, chartTop),
    }));

    // Determine final colour — green if healthy, red if critical
    const lastBalance = values[values.length - 1];
    const incomeRef = balanceHistory[0]?.balance || 1;
    const healthRatio = lastBalance / incomeRef;
    const lineColor = healthRatio > 0.5 ? '#00e5ff'
        : healthRatio > 0.25 ? '#8b5cf6'
        : '#ff2bd6';

    return (
        <div style={{ position: 'relative' }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                role="img"
                aria-label="Balance trajectory chart"
            >
                <defs>
                    <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
                        <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
                    </linearGradient>
                    <clipPath id="chartClip">
                        <rect x={chartLeft} y={chartTop} width={chartRight - chartLeft} height={chartBottom - chartTop} />
                    </clipPath>
                </defs>

                {/* Grid lines */}
                {yTicks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={chartLeft} y1={tick.y}
                            x2={chartRight} y2={tick.y}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                        />
                        <text
                            x={chartLeft - 8}
                            y={tick.y + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="rgba(154,164,178,0.7)"
                        >
                            {tick.value >= 1000 ? `${(tick.value / 1000).toFixed(1)}k` : tick.value}
                        </text>
                    </g>
                ))}

                {/* X-axis baseline */}
                <line
                    x1={chartLeft} y1={chartBottom}
                    x2={chartRight} y2={chartBottom}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                />

                {/* Area fill */}
                <path
                    d={areaPath}
                    fill="url(#balanceGrad)"
                    clipPath="url(#chartClip)"
                />

                {/* Animated line stroke */}
                <motion.path
                    d={linePath}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: `drop-shadow(0 0 6px ${lineColor})` }}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    clipPath="url(#chartClip)"
                />

                {/* Data points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle
                            cx={p.x} cy={p.y} r="14"
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setTooltip({ x: p.x, y: p.y, label: p.label, balance: p.balance, idx: i })}
                            onMouseLeave={() => setTooltip(null)}
                        />
                        <motion.circle
                            cx={p.x} cy={p.y} r={tooltip?.idx === i ? 6 : 4}
                            fill={lineColor}
                            stroke="var(--bg-primary)"
                            strokeWidth="2"
                            style={{ filter: `drop-shadow(0 0 4px ${lineColor})` }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + i * 0.05, type: 'spring', stiffness: 300 }}
                        />
                    </g>
                ))}

                {/* Tooltip */}
                {tooltip && (() => {
                    const ttW = 120, ttH = 44;
                    const ttX = Math.min(tooltip.x - ttW / 2, W - ttW - 4);
                    const ttY = tooltip.y - ttH - 12;
                    return (
                        <g>
                            <rect x={ttX} y={ttY} width={ttW} height={ttH} rx="8" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="1" />
                            <text x={ttX + ttW / 2} y={ttY + 16} textAnchor="middle" fontSize="10" fill="rgba(154,164,178,0.8)">{tooltip.label}</text>
                            <text x={ttX + ttW / 2} y={ttY + 34} textAnchor="middle" fontSize="12" fontWeight="700" fill={lineColor}>
                                KES {tooltip.balance.toLocaleString()}
                            </text>
                        </g>
                    );
                })()}

                {/* X-axis labels — first and last only to avoid crowding */}
                {[0, balanceHistory.length - 1].map(i => (
                    <text
                        key={i}
                        x={points[i].x}
                        y={chartBottom + 20}
                        textAnchor="middle"
                        fontSize="10"
                        fill="rgba(154,164,178,0.6)"
                    >
                        {balanceHistory[i].label}
                    </text>
                ))}
            </svg>
        </div>
    );
}
