import { useState, useEffect, useCallback } from "react";

// The timer duration must be passed in minutes when using the hook.
const ONE_MINUTE_IN_MS = 60 * 1000;

export function useCountdownTimer(localStorageKey, durationMinutes) {
    const [remainingTime, setRemainingTime] = useState(0);
    const isTimerActive = remainingTime > 0;
    const durationMs = durationMinutes * ONE_MINUTE_IN_MS;

    // Helper to format time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Checks localStorage for an active timer and updates the state.
    const initializeTimer = useCallback(() => {
        const expiryTime = localStorage.getItem(localStorageKey);

        if (expiryTime) {
            const timeRemainingMs = parseInt(expiryTime, 10) - Date.now();

            if (timeRemainingMs > 1000) {
                setRemainingTime(Math.ceil(timeRemainingMs / 1000));
                return true;
            }
            // Timer expired, clean up
            localStorage.removeItem(localStorageKey);
        }
        setRemainingTime(0);
        return false;
    }, [localStorageKey]);

    // Function to start a new timer
    const startTimer = useCallback(() => {
        const expiryTime = Date.now() + durationMs;
        localStorage.setItem(localStorageKey, expiryTime);
        initializeTimer();
    }, [localStorageKey, durationMs, initializeTimer]);


    // 1. Initial check on mount
    useEffect(() => {
        initializeTimer();
    }, [initializeTimer]);

    // 2. Countdown interval effect
    useEffect(() => {
        let timer;
        if (isTimerActive) {
            timer = setInterval(() => {
                setRemainingTime((prevTime) => {
                    if (prevTime <= 1) {
                        // Time's up, clear local storage and interval
                        localStorage.removeItem(localStorageKey);
                        clearInterval(timer);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        // Cleanup function
        return () => clearInterval(timer);
    }, [isTimerActive, localStorageKey]);

    return {
        remainingTime,
        isTimerActive,
        startTimer,
        formatTime
    };
}