import { useEffect, useRef } from "react";

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    console.log("useInterval - new callback found, overwriting...");
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    console.log("useInterval - Setting up Interval...");
    const id = setInterval(() => savedCallback.current(), delay);

    return () => {
      console.log("useInterval - Clearing Interval...");
      clearInterval(id);
    };
  }, [delay]);
};

export default useInterval;
