const COLOR_MAP = {
    green: { bg: '#39ff14', glow: 'rgba(57, 255, 20, 0.3)' },
    pink: { bg: '#ff6ec7', glow: 'rgba(255, 110, 199, 0.3)' },
    cyan: { bg: '#00f0ff', glow: 'rgba(0, 240, 255, 0.3)' },
    yellow: { bg: '#ffe500', glow: 'rgba(255, 229, 0, 0.3)' },
    purple: { bg: '#b026ff', glow: 'rgba(176, 38, 255, 0.3)' },
};

export default function ProgressBar({ value, max, label, color = 'cyan' }) {
    const percent = Math.min(100, (value / max) * 100);
    const colors = COLOR_MAP[color] || COLOR_MAP.cyan;

    return (
        <div className="w-full">
            <div className="flex justify-between mb-1.5 text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="font-semibold" style={{ color: colors.bg }}>{value}/{max}</span>
            </div>
            <div className="w-full bg-surface-800 rounded-full h-2.5 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${percent}%`,
                        backgroundColor: colors.bg,
                        boxShadow: `0 0 8px ${colors.glow}`
                    }}
                />
            </div>
        </div>
    );
}