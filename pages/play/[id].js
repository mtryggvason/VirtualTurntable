import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Buffer, start } from "tone";
import Rotate from "../../src/svgs/rotate.svg";
import usePlayer from "../../hooks/usePlayer";
import { getSongById } from "../../utils/firestore";
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
      player.volume.value = 0;
    } else {
      player.volume.value = -Infinity;
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

function TurntablePlayer() {
  const router = useRouter();
  const { id } = router.query;

  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showRotatingMessage, setShowRotatingMessage] = useState(false);

  // Load song data when ID is available
  useEffect(() => {
    if (id) {
      loadSongData();
    }
  }, [id]);

  const loadSongData = async () => {
    try {
      setLoading(true);
      const songData = await getSongById(id);
      if (!songData) {
        setError("Song not found");
        return;
      }
      setSong(songData);
    } catch (err) {
      setError("Failed to load song");
      console.error("Error loading song:", err);
    } finally {
      setLoading(false);
    }
  };

  const player = usePlayer(song?.songUrl, true, (p) => {
    // Reset buffers for new song
    buffers = [];
    reversedBuffers = [];

    for (var i = 0; i < p._buffer.numberOfChannels; i++) {
      const buffer = p._buffer.getChannelData(i);
      buffers.push(buffer.slice());
      reversedBuffers.push(buffer.slice().reverse());
    }
  });

  useEffect(() => {
    setShowMessage(
      !window.DeviceOrientationEvent || !DeviceMotionEvent.requestPermission
    );
  }, []);

  const activateListener = async (e) => {
    e.preventDefault();
    try {
      start();
      const noSleep = new NoSleep();
      noSleep.enable();
      if (player && player.buffer) {
        if (player.state === "started") {
          player.stop();
        }
        player.start();
        player.playbackRate = 0;
        setPlaying(true);
      }
    } catch (error) {
      console.log("Audio start failed:", error);
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
        setPlaying(true);
        setShowRotatingMessage(true);
        lastRoationTime = Date.now();
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <div className="title-wrapper">
          <span className="playing-title">Loading...</span>
        </div>
        <div className="vinyl-wrapper">
          <div className="center">Loading song...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <div className="title-wrapper">
          <span className="playing-title">Error</span>
        </div>
        <div className="vinyl-wrapper">
          <div className="center">
            <p>{error}</p>
            <button onClick={() => router.push("/")} className="center">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No song found
  if (!song) {
    return (
      <div className="app">
        <div className="title-wrapper">
          <span className="playing-title">Not Found</span>
        </div>
        <div className="vinyl-wrapper">
          <div className="center">
            <p>Song not found</p>
            <button onClick={() => router.push("/")} className="center">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="title-wrapper">
        <span className="playing-title">Now Playing</span>
        <div className="track-title">
          {song.artist} - {song.name}
        </div>
      </div>
      <div className="vinyl-wrapper">
        <img
          alt="vinyl"
          className={`vinyl-image ${player ? "" : "loading"}`}
          src={song.artworkUrl || "./ticket_to_tene.png"}
        />
        <div className="vinyl-dot center" />
        {!player && <div className="center">Loading audio...</div>}
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
              src="/close.png"
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
      <div className="buy-wrapper">
        <button onClick={() => router.push("/")} className="buy-wrapper">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default TurntablePlayer;
