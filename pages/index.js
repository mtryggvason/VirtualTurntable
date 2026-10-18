import { useState } from "react";
import Rotate from "../src/svgs/rotate.svg";
import useTurntable, { rotationToRate } from "../hooks/useTurntable";
import WaveformRing from "../components/WaveformRing";
import WaveformOverview from "../components/WaveformOverview";
import CloseButton from "../components/CloseButton";
import useHasGyroscope from "../hooks/useHasGyroscope";

import NoSleep from "nosleep.js";

function App() {
  const [playing, setPlaying] = useState(false);
  const [showRotatingMessage, setShowRotatingMessage] = useState(false);

  // Without a motion sensor the song can't be played, so don't download it
  const hasGyroscope = useHasGyroscope();
  const { ready, start, setRate, peaks, duration, getPosition, seek } =
    useTurntable(hasGyroscope ? "./split_the_difference.mp3" : null);

  const activateListener = async (e) => {
    e.preventDefault();
    start();
    const noSleep = new NoSleep();
    noSleep.enable().catch((error) => console.log("Wake lock failed:", error));
    setPlaying(true);

    if (window.DeviceOrientationEvent) {
      const response = DeviceMotionEvent.requestPermission
        ? await DeviceMotionEvent.requestPermission()
        : "granted";
      if (
        response === "granted" ||
        (response.result && response.result === "granted")
      ) {
        const handleDeviceMotion = (e) => {
          setRate(rotationToRate(e.rotationRate.gamma));
        };

        window.addEventListener("devicemotion", handleDeviceMotion);
        setPlaying(true);
        setShowRotatingMessage(true);
      }
    }
  };
  return (
    <div className="app">
      <div className="title-wrapper">
        <span className="playing-title ">Now Playing</span>
        <div className="track-title">Moff & Tarkin - Split the Difference</div>
      </div>
      <div className="vinyl-wrapper">
        {hasGyroscope !== false && (
          <WaveformRing peaks={peaks} getPosition={getPosition} />
        )}
        <img
          alt="vinyl"
          className={`vinyl-image  ${ready ? "" : "loading"}`}
          src={"./sit_down_to.jpg"}
        />
        <div className="vinyl-dot center" />

        {hasGyroscope !== false && !ready && (
          <span className="loading-label center">Loading…</span>
        )}
        {ready && !playing && (
          <button className="center" onClick={activateListener}>
            Get Started
          </button>
        )}
        {playing && showRotatingMessage && (
          <div className="message center">
            <CloseButton onClick={() => setShowRotatingMessage(false)} />
            <Rotate className="rotate rotating-svg"></Rotate>
            Turn off silent mode and spin the phone to hear the song play
          </div>
        )}
        {hasGyroscope === false && (
          <div className="message">
            This turntable is played by spinning your phone, and this device
            has no motion sensor.
            <br />
            <br />
            Open this page on your phone to listen.
          </div>
        )}
      </div>
      {hasGyroscope !== false && (
        <WaveformOverview
          peaks={peaks}
          duration={duration}
          getPosition={getPosition}
          seek={seek}
        />
      )}
      <a className="buy-wrapper" href="https://fortunea.bandcamp.com/album/sit-down-to-fortunea041">
        Buy on{" "}
        <img
          className="buy-wrapper-image"
          alt="bandcamp"
          src={"./bandcamp.png"}
        />
      </a>
    </div>
  );
}

export default App;
