import React, { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { Buffer, start } from "tone";
import Loader from "react-loader-spinner";
import Rotate from "../src/svgs/rotate.svg";
import usePlayer from "../hooks/usePlayer";

import NoSleep from "nosleep.js";

let reversed = false;
let buffers = [];
let reversedBuffers = [];

/**
 *  Reverse the buffer.
 *  @private
 *  @return {Tone.Buffer} this
 */
Buffer.prototype._reverse = function () {
  if (this.loaded) {
    reversed = !reversed;
    if (reversed) {
      this._buffer.copyToChannel(reversedBuffers[0], 0, 0);
      this._buffer.copyToChannel(reversedBuffers[1], 1, 0);
    } else {
      this._buffer.copyToChannel(buffers[0], 0, 0);
      this._buffer.copyToChannel(buffers[1], 1, 0);
    }
  }
  return this;
};

const setRPM = (gamma, player) => {
  const rpm = Math.round((gamma * 60) / 360);
  if (player) {
    const playbackRate = Math.abs(rpm / 45);
    if (playbackRate > 0.1) {
      player.playbackRate = playbackRate;
    } else {
      player.playbackRate = 0;
    }
    const reverse = player.reverse;
    player.reverse = rpm > 0;
    if (reverse !== player.reverse) {
      offset = player.buffer.duration - offset;
      offset = Math.max(Math.min(offset, player.buffer.duration), 0);
      player.start(0, offset);
    }
  }
};
const updateOffset = (
  gamma,
  offset,
  timeSinceLastUpdate,
  minValue,
  maxValue
) => {
  const rpm = Math.round((gamma * 60) / 360);
  const playbackRate = Math.abs(rpm / 45);
  const tmp = offset + (playbackRate * timeSinceLastUpdate) / 1000;
  return Math.max(Math.min(tmp, maxValue), minValue);
};

let offset = 0;
let lastRoationTime = 0;
function App() {
  const [playing, setPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showRotatingMessage, setShowRotatingMessage] = useState(false);

  const player = usePlayer("./socks.[mp3|ogg]", true, (p) => {
    // Player loaded callback
  });
  useEffect(() => {
    setShowMessage(!window.DeviceOrientationEvent || !isMobile);
  }, []);

  const activateListener = async () => {
    start();
    const noSleep = new NoSleep();

    if (player && player.buffer) {
      player.start();
      player.playbackRate = 0;
    }
    if (window.DeviceOrientationEvent) {
      const response = DeviceMotionEvent.requestPermission
        ? await DeviceMotionEvent.requestPermission()
        : "granted";
      if (
        response === "granted" ||
        (response.result && response.result === "granted")
      ) {
        const handleDeviceMotion = (e) => {
          if (player && player.buffer) {
            offset = updateOffset(
              e.rotationRate.gamma,
              offset,
              Date.now() - lastRoationTime,
              0,
              player.buffer.duration
            );
            setRPM(e.rotationRate.gamma, player);
            lastRoationTime = Date.now();
          }
        };

        window.addEventListener("devicemotion", handleDeviceMotion);
        noSleep.enable();
        setPlaying(true);
        setShowRotatingMessage(true);
        lastRoationTime = Date.now();
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
          className={`vinyl-image  ${player ? "" : "loading"}`}
          src={"./ticket_to_tene.png"}
        />
        <div className="vinyl-dot center" />
        {!player && (
          <Loader
            type="Audio"
            className="center"
            color="#00BFFF"
            height={100}
            width={100}
          />
        )}
        {player && !playing && (
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
