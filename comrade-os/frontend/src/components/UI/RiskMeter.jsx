export default function RiskMeter({ score }) {
    const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
    const color = clampedScore < 30 ? '#39ff14' : clampedScore < 70 ? '#ffe500' : '#ff6ec7';
    const label = clampedScore < 30 ? 'Low Risk' : clampedScore < 70 ? 'Moderate' : 'High Risk';

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-400">{label}</span>
                <span className="font-bold" style={{ color }}>{clampedScore}/100</span>
            </div>
            <div className="w-full bg-surface-800 rounded-full h-2.5 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${clampedScore}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 12px ${color}40`
                    }}
                />
            </div>
        </div>
    );
}