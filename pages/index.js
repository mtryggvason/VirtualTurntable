import { useState, useEffect } from "react";
import Rotate from "../src/svgs/rotate.svg";
import useTurntable, { rotationToRate } from "../hooks/useTurntable";

import NoSleep from "nosleep.js";

function App() {
  const [playing, setPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showRotatingMessage, setShowRotatingMessage] = useState(false);

  const { ready, start, setRate } = useTurntable("./socks.mp3");
  useEffect(() => {
    setShowMessage(
      !window.DeviceOrientationEvent || !DeviceMotionEvent.requestPermission
    );
  }, []);

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
        <div className="track-title">Moff & Tarkin - Socks by the Sofa</div>
      </div>
      <div className="vinyl-wrapper">
        <img
          alt="vinyl"
          className={`vinyl-image  ${ready ? "" : "loading"}`}
          src={"./ticket_to_tene.png"}
        />
        <div className="vinyl-dot center" />

        {ready && !playing && (
          <button className="center" onClick={activateListener}>
            Get Started
          </button>
        )}
        {playing && showRotatingMessage && (
          <div className="message center">
            <img
              alt="close"
              onClick={() => setShowRotatingMessage(false)}
              className="message-close"
              src="close.png"
            ></img>
            <Rotate className="rotate rotating-svg"></Rotate>
            Turn off silent mode and spin the phone to hear the song play
          </div>
        )}
        {showMessage && (
          <div className="message">
            Looks like your device does not support the
            <a
              style={{ marginLeft: "5px" }}
              href="https://caniuse.com/#feat=deviceorientation"
            >
              Device Motion event
            </a>
            . <br />
            Please try again with a mobile device
          </div>
        )}
      </div>
      <a className="buy-wrapper" href="https://lagaffetales.bandcamp.com">
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
