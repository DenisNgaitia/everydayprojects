import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EnvironmentBackground() {
    const [timeOfDay, setTimeOfDay] = useState('night');
    const [weather, setWeather] = useState('clear'); // Defaulting to clear skies for now

    useEffect(() => {
        // ---------------------------------------------------------
        
        // ---------------------------------------------------------
        const fetchWeather = async () => {
            try {
                // Replace this dummy key with your actual OpenWeatherMap API key
                const apiKey = '761d4f1a52f488b47902f85dd01b3ee5';
                const city = 'Athi River,KE';
                
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
                
                if (!response.ok) throw new Error('Atmospheric sync failed');
                
                const data = await response.json();
                
                // OpenWeatherMap stores the primary condition in weather[0].main
                const mainCondition = data.weather[0].main.toLowerCase();
                
                // Map the live API data to our visual environment states
                if (mainCondition.includes('rain') || mainCondition.includes('drizzle') || mainCondition.includes('thunderstorm')) {
                    setWeather('rain');
                } else if (mainCondition.includes('cloud')) {
                    setWeather('clouds'); 
                } else {
                    setWeather('clear');
                }
                
            } catch (error) {
                console.error("OS Environment Error:", error);
                // Fallback to clear skies so the UI doesn't break if offline
                setWeather('clear'); 
            }
        };

        // Fire the fetch immediately on boot
        fetchWeather();
        
        // Ping the weather API every 15 minutes (900,000 ms) 
        // This keeps it perfectly synced without burning through your free API quota
        const weatherInterval = setInterval(fetchWeather, 900000);
        // ---------------------------------------------------------

        const determineEnvironment = () => {
            const hour = new Date().getHours();
            
            if (hour >= 5 && hour < 12) {
                setTimeOfDay('morning');
            } else if (hour >= 12 && hour < 17) {
                setTimeOfDay('afternoon');
            } else if (hour >= 17 && hour < 20) {
                setTimeOfDay('evening');
            } else {
                setTimeOfDay('night');
            }
        };

        determineEnvironment();
        // Update the environment every minute
        const interval = setInterval(determineEnvironment, 60000);
        // Update the environment every minute
        const timeInterval = setInterval(determineEnvironment, 60000);
        
        // CRITICAL: Cleanup BOTH intervals to prevent memory leaks and API burning
        return () => {
            clearInterval(timeInterval);
            clearInterval(weatherInterval);
        };
    }, []);

    // Define the sleek, weather-app style gradients
    const getBackgroundStyle = () => {
        switch (timeOfDay) {
            case 'morning':
                return 'linear-gradient(to bottom, #8BA3C7, #D9E2EC)'; // Soft sunrise
            case 'afternoon':
                return 'linear-gradient(to bottom, #4A90E2, #90CAF9)'; // Bright Athi River sky
            case 'evening':
                return 'linear-gradient(to bottom, #2C3E50, #E74C3C)'; // Deep sunset
            case 'night':
            default:
                // Your custom Obsidian Club theme
                return 'radial-gradient(ellipse at top, #130B29 0%, #05050A 100%)'; 
        }
    };

    return (
        <motion.div 
            className="fixed inset-0 z-[-1] transition-all duration-1000 ease-in-out"
            style={{ background: getBackgroundStyle() }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
        >
            {/* Optional: We can add particle effects here later (like rain or stars) based on the weather state */}
            {weather === 'rain' && (
                <div className="absolute inset-0 bg-[url('/rain-overlay.png')] opacity-20 mix-blend-screen animate-slide-down"></div>
            )}
        </motion.div>
    );
}