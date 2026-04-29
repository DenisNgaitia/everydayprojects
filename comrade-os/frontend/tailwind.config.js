/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif']
            },
            colors: {
                accent: {
                    pink: 'var(--accent-pink)',
                    purple: 'var(--accent-purple)',
                    cyan: 'var(--accent-cyan)',
                },
                surface: {
                    900: 'var(--bg-primary)',
                    800: 'var(--bg-secondary)',
                },
                // Legacy compatibility aliases
                neon: {
                    pink: 'var(--accent-pink)',
                    cyan: 'var(--accent-cyan)',
                    yellow: '#ffe500',
                    green: '#39ff14',
                    purple: 'var(--accent-purple)',
                    orange: '#ff9f1c'
                },
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'fade-in': 'fade-in 0.4s ease-out',
            },
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' }
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
            }
        }
    },
    plugins: []
};