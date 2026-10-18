import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Rotate from "../../src/svgs/rotate.svg";
import useTurntable, { rotationToRate } from "../../hooks/useTurntable";
import WaveformRing from "../../components/WaveformRing";
import { getSongById } from "../../utils/firestore";
import NoSleep from "nosleep.js";

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

  const { ready, start, setRate, peaks, getPosition } = useTurntable(song?.songUrl);

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

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <div className="title-wrapper">
          <span className="playing-title">Loading...</span>
        </div>
        <div className="vinyl-wrapper">
        <WaveformRing peaks={peaks} getPosition={getPosition} />
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
          className={`vinyl-image ${ready ? "" : "loading"}`}
          src={song.artworkUrl || "./ticket_to_tene.png"}
        />
        <div className="vinyl-dot center" />
        {!ready && <div className="center">Loading audio...</div>}
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
