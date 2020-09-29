import React, { useState, useEffect } from "react";
import { fromEvent } from "rxjs";
import { throttleTime } from "rxjs/operators";

import { isMobile } from "react-device-detect";
import { Player, Buffer } from "tone";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { ReactComponent as Rotate } from "./svgs/rotate.svg";
import "./fonts.css";
import "./App.css";
import NoSleep from "nosleep.js";

let reversed = false;
let buffers = [];
let reversedBuffers = [];
const noSleep = new NoSleep();

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

if (window.location.protocol !== "https:") {
  /* window.location.href =
    "https:" + window.location.href.substring(window.location.protocol.length);*/
}

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
      console.log("REWIND");
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

    if (window.DeviceOrientationEvent) {
      const response = DeviceMotionEvent.requestPermission
        ? await DeviceMotionEvent.requestPermission()
        : "granted";
      debugger
      if (response === "granted" || (response.result && response.result=== "granted")) {
        player.playbackRate = 1;
        setPlaying(true);
        player.start();
        player.playbackRate = 0;
        noSleep.enable();
        setPlaying(true);
        setShowRotatingMessage(true);
        player.context.updateInterval = 0.01;
        lastRoationTime = new Date();
        const stream = fromEvent(window, "devicemotion").pipe(throttleTime(5));
        stream.subscribe((e) => {
          debugger
          player.start();
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
  /*
  const devTools = (
    <>
      <button
        onClick={() => {
          player.reverse = !player.reverse;
          offset = player.buffer.duration - offset;
          player.start(0, offset);
        }}
      >
        REVERSE
      </button>
      <input
        onChange={(event) => (player.playbackRate = event.target.value)}
        step="0.05"
        type="range"
        min="0"
        max="1"
        class="slider"
        id="myRange"
      />
      )
    </>
  );
  */
  return (
    <div className="app">
      <PlayerComponent
        url="./Midday.[mp3|ogg]"
        onload={(p) => {
          if (!player.start) {
            console.log("SET PLAYER");
            setPlayer(p);
          }
        }}
        loop
      />
      <div className="title-wrapper">
        <span className="playing-title ">Now Playing</span>
        <div className="track-title">Moff & Tarkin - Powerplay</div>
      </div>
      <div className="vinyl-wrapper">
        <img
          alt="vinyl"
          className={`vinyl-image  ${player ? "" : "loading"}`}
          src="man.jpg"
        />
        <div className="vinyl-dot center" />
        {!player.start && (
          <Loader
            type="Puff"
            className="center"
            color="#00BFFF"
            height={300}
            width={300}
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
            Turn off silent mode and rotate the phone to hear the song play
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
          src="bandcamp-logotype-light-512.png"
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
  }, []);
  return null;
};

export default App;
