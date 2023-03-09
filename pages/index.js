import React, { useState, useEffect } from "react";
import { fromEvent } from "rxjs";
import { throttleTime } from "rxjs/operators";
import { isMobile } from "react-device-detect";
import { Player, Buffer, start } from "tone";
import Loader from "react-loader-spinner";
import Rotate from "../src/svgs/rotate.svg";

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
  const [player, setPlayer] = useState({});
  const [playing, setPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showRotatingMessage, setShowRotatingMessage] = useState(false);
  useEffect(() => {
    setShowMessage(!window.DeviceOrientationEvent || !isMobile);
  }, []);

  const activateListener = async () => {
    start();
    const noSleep = new NoSleep();

    player.start();
    player.playbackRate = 0;
    if (window.DeviceOrientationEvent) {
      const response = DeviceMotionEvent.requestPermission
        ? await DeviceMotionEvent.requestPermission()
        : "granted";
      if (
        response === "granted" ||
        (response.result && response.result === "granted")
      ) {
        const stream = fromEvent(window, "devicemotion").pipe(throttleTime(10));
        noSleep.enable();
        setPlaying(true);
        setShowRotatingMessage(true);
        lastRoationTime = new Date();
        stream.subscribe((e) => {
          offset = updateOffset(
            e.rotationRate.gamma,
            offset,
            new Date() - lastRoationTime,
            0,
            player.buffer.duration
          );
          setRPM(e.rotationRate.gamma, player);
          lastRoationTime = new Date();
        });
      }
    }
  };
  return (
    <div className="app">
      <PlayerComponent
        url="./socks.[mp3|ogg]"
        onload={(p) => {
          if (!player.start) {
            setPlayer(p);
          }
        }}
        loop
      />
      <div className="title-wrapper">
        <span className="playing-title ">Now Playing</span>
        <div className="track-title">Moff & Tarkin - Socks by the Sofa</div>
      </div>
      <div className="vinyl-wrapper">
        <img
          alt="vinyl"
          className={`vinyl-image  ${player ? "" : "loading"}`}
          src={'./ticket_to_tene.png'}
        />
        <div className="vinyl-dot center" />
        {!player.start && (
          <Loader
            type="Audio"
            className="center"
            color="#00BFFF"
            height={100}
            width={100}
          />
        )}
        {player.start && !playing && (
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
          src={'./bandcamp.png'}
        />
      </a>
    </div>
  );
}

const PlayerComponent = (props) => {
  useEffect(() => {
    const player = new Player({
      onload: () => {
        for (var i = 0; i < player._buffer.numberOfChannels; i++) {
          const buffer = player._buffer.getChannelData(i);
          buffers.push(buffer.slice());
          reversedBuffers.push(buffer.slice().reverse());
        }
        props.onload(player);
      },
      url: props.url,
      loop: props.loop,
    }).toDestination();
  }, [props]);
  return null;
};

export default App;
