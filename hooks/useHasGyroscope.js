import { useEffect, useState } from "react";

// Whether the device can drive the turntable with its motion sensor: null
// until known (e.g. during server rendering), then true or false.
//
// Browsers can't tell us directly: desktop Chrome exposes DeviceMotionEvent
// (and requestPermission) without having a sensor, and iOS sends no motion
// events until permission is granted. A touch-first device is the best
// signal we have before the user taps Get Started.
const useHasGyroscope = () => {
  const [hasGyroscope, setHasGyroscope] = useState(null);

  useEffect(() => {
    setHasGyroscope(
      typeof window.DeviceMotionEvent !== "undefined" &&
        window.matchMedia("(pointer: coarse)").matches
    );
  }, []);

  return hasGyroscope;
};

export default useHasGyroscope;
