import { useState, useEffect, useRef } from "react";

// Main App component for the Pomodoro Timer
function App() {
  // Define default durations for Pomodoro, Short Break, and Long Break in seconds
  const POMODORO_DURATION = 25 * 60; // 25 minutes
  const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
  const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
  const POMODOROS_UNTIL_LONG_BREAK = 4; // Long break after 4 pomodoros

  // State variables for the timer
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION); // Current time remaining in seconds
  const [currentSession, setCurrentSession] = useState("Pomodoro"); // Current session type: 'Pomodoro', 'Short Break', 'Long Break'
  const [isPaused, setIsPaused] = useState(true); // True if the timer is paused, false if running
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0); // Count of completed Pomodoro sessions
  const intervalRef = useRef(null); // Ref to store the interval ID for cleanup

  // Audio object for the end-of-session alert
  const audioRef = useRef(
    new Audio("https://www.soundjay.com/buttons/beep-07a.mp3")
  ); // Simple beep sound

  // useEffect hook to manage the timer countdown
  useEffect(() => {
    // If the timer is paused or time has run out, clear any existing interval
    if (isPaused || timeLeft <= 0) {
      clearInterval(intervalRef.current);
      return;
    }

    // Set up a new interval to decrement the timeLeft every second
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup function: Clear the interval when the component unmounts or dependencies change
    return () => clearInterval(intervalRef.current);
  }, [isPaused, timeLeft]); // Dependencies: re-run effect when isPaused or timeLeft changes

  // useEffect hook to handle session transitions when timeLeft hits zero
  useEffect(() => {
    if (timeLeft === 0) {
      audioRef.current.play(); // Play the alert sound

      // Logic for transitioning between sessions
      if (currentSession === "Pomodoro") {
        setPomodorosCompleted((prevCount) => prevCount + 1); // Increment pomodoro count
        if ((pomodorosCompleted + 1) % POMODOROS_UNTIL_LONG_BREAK === 0) {
          setCurrentSession("Long Break");
          setTimeLeft(LONG_BREAK_DURATION);
        } else {
          setCurrentSession("Short Break");
          setTimeLeft(SHORT_BREAK_DURATION);
        }
      } else {
        // If it's a break (Short or Long)
        setCurrentSession("Pomodoro");
        setTimeLeft(POMODORO_DURATION);
      }
      setIsPaused(true); // Pause the timer after transition
    }
  }, [timeLeft, currentSession, pomodorosCompleted]); // Dependencies: re-run effect when these states change

  // Function to start or resume the timer
  const startTimer = () => {
    setIsPaused(false);
  };

  // Function to pause the timer
  const pauseTimer = () => {
    setIsPaused(true);
  };

  // Function to reset the current session's timer
  const resetTimer = () => {
    clearInterval(intervalRef.current); // Clear any active interval
    setIsPaused(true); // Pause the timer
    // Reset time based on the current session type
    if (currentSession === "Pomodoro") {
      setTimeLeft(POMODORO_DURATION);
    } else if (currentSession === "Short Break") {
      setTimeLeft(SHORT_BREAK_DURATION);
    } else {
      // Long Break
      setTimeLeft(LONG_BREAK_DURATION);
    }
  };

  // Function to skip to the next session
  const skipSession = () => {
    clearInterval(intervalRef.current); // Clear any active interval
    audioRef.current.pause(); // Stop any currently playing sound
    audioRef.current.currentTime = 0; // Reset audio playback position

    if (currentSession === "Pomodoro") {
      setPomodorosCompleted((prevCount) => prevCount + 1); // Increment pomodoro count as it's being skipped
      if ((pomodorosCompleted + 1) % POMODOROS_UNTIL_LONG_BREAK === 0) {
        setCurrentSession("Long Break");
        setTimeLeft(LONG_BREAK_DURATION);
      } else {
        setCurrentSession("Short Break");
        setTimeLeft(SHORT_BREAK_DURATION);
      }
    } else {
      setCurrentSession("Pomodoro");
      setTimeLeft(POMODORO_DURATION);
    }
    setIsPaused(true); // Pause the timer after skipping
  };

  // Format the time left into minutes and seconds for display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 p-4 font-inter text-white">
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-2xl p-8 shadow-2xl max-w-md w-full border border-indigo-700 flex flex-col items-center">
        {/* Session type display */}
        <h2 className="text-4xl font-extrabold mb-6 tracking-wide text-indigo-300">
          {currentSession}
        </h2>

        {/* Timer display */}
        <div className="text-8xl font-mono mb-8 p-4 bg-gray-900 rounded-xl shadow-inner border border-indigo-600 flex items-center justify-center w-64 h-32">
          {/* Pad single digit seconds with a leading zero */}
          {`${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`}
        </div>

        {/* Pomodoros Completed counter */}
        <p className="text-lg text-indigo-400 mb-8">
          Pomodoros Completed: {pomodorosCompleted}
        </p>

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-4 w-full">
          {isPaused ? (
            <button
              onClick={startTimer}
              className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 ease-in-out hover:scale-105 border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex-1 min-w-[120px] bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 ease-in-out hover:scale-105 border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1"
            >
              Pause
            </button>
          )}
          <button
            onClick={resetTimer}
            className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 ease-in-out hover:scale-105 border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
          >
            Reset
          </button>
          <button
            onClick={skipSession}
            className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 ease-in-out hover:scale-105 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
