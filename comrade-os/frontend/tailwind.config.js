/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
            },
            colors: {
                neon: {
                    pink: '#ff6ec7',
                    cyan: '#00f0ff',
                    yellow: '#ffe500',
                    green: '#39ff14',
                    purple: '#b026ff',
                    orange: '#ff9f1c'
                },
                surface: {
                    900: '#0a0a1a',
                    800: '#0f0f2a',
                    700: '#1a1a3e',
                    600: '#252550',
                    500: '#2f2f60'
                }
            },
            backdropBlur: {
                xs: '2px'
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 15s ease infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'fade-in': 'fade-in 0.4s ease-out'
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 5px currentColor' },
                    '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' }
                },
                'gradient-shift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' }
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                }
            }
        }
    },
    plugins: []
};