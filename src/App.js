import React, { useState, useEffect } from "react";
import { fromEvent } from "rxjs";
import { throttleTime } from "rxjs/operators";

import { isMobile } from "react-device-detect";
import { Player, Buffer } from "tone";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { ReactComponent as Rotate } from "./svgs/rotate.svg";
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
    if (playbackRate > 0.05) {
      player.playbackRate = playbackRate;
    } else {
      player.playbackRate = 0;
    }
    player.reverse = rpm > 0;
    if (player.reverse) {
      offset = player.buffer.duration() - offset;
      player.start(offset);
    }
  }
};
const updateOffset = (gamma, offset, timeSinceLastUpdate) => {
  const rpm = Math.round((gamma * 60) / 360);
  const playbackRate = Math.abs(rpm / 45);
  return offset + (playbackRate * timeSinceLastUpdate) / 60000;
};

let offset = 0;
let lastRoationTime = 0;
function App() {
  const [player, setPlayer] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    //setShowMessage(!window.DeviceOrientationEvent || !isMobile);
  }, []);

  const activateListener = async () => {
    player.playbackRate = 1;
    setPlaying(true);
    if (window.DeviceOrientationEvent) {
      const response = DeviceMotionEvent.requestPermission
        ? await DeviceMotionEvent.requestPermission()
        : "granted";
      if (response === "granted") {
        player.start();
        noSleep.enable();
        player.playbackRate = 0;
        setPlaying(true);
        player.context.updateInterval = 0.01;
        const stream = fromEvent(window, "devicemotion").pipe(throttleTime(5));
        stream.subscribe((e) => {
          offset = updateOffset(
            e.rotationRate.gamma,
            offset,
            lastRoationTime - new Date()
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
      <button onClick={reverse}>REVERSE </button>
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
        onload={(player) => {
          setPlayer(player);
        }}
        loop
      />
      <img
        alt="vinyl"
        className={`vinyl-image center ${player ? "" : "loading"}`}
        src="man.jpg"
      />
      <div className="vinyl-dot center" />
      {!player && (
        <Loader
          type="Puff"
          className="center"
          color="#00BFFF"
          height={350}
          width={350}
        />
      )}
      {player && !playing && (
        <button className="center" onClick={activateListener}>
          Get Started
        </button>
      )}
      {playing && (
        <div className="center message">
          <Rotate className="rotate rotating-svg"></Rotate>
          Turn of silent mode and rotate the phone to hear the song play
        </div>
      )}
      {showMessage && (
        <div className="center message">
          Looks like your device does not support the{" "}
          <a href="https://caniuse.com/#feat=deviceorientation">
            Device Motion event
          </a>
          . <br />
          Please try again with a mobile device
        </div>
      )}
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
    }).toMaster();
  }, [props]);
  return null;
};

export default App;
