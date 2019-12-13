import React, {useState, useEffect} from 'react';
import { throttle, debounce } from 'throttle-debounce';
import { isMobile } from 'react-device-detect';
import { Player } from 'tone';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import { ReactComponent as Rotate } from './svgs/rotate.svg';
import './App.css';


if (window.location.protocol != 'https:') {
  window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

const setRPM = (gamma, player) => {
  const rpm =  Math.round(egamma * 60 / 360);
  if (player) {
    const playbackRate = Math.abs(rpm / 45);
    if (Math.abs(playbackRate - player.playbackRate) > 0.05) {
      player.playbackRate = Math.abs(x / 45);
      player.reverse = rpm > 0
    }
  } 
}


function App() {
  const [x, setX] = useState(0);
  const [player, setPlayer] = useState(false);
  const [playing, setPlaying] = useState(false)
  const [showMessage, setShowMessage] = useState(false);

  const activateListener = () => {
 
    //player.autostart = true;
    if (DeviceMotionEvent.requestPermission) {
      player.start();
      player.playbackRate = 0;
      setPlaying(true);
      DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response == 'granted') {
          window.addEventListener('devicemotion', throttle(100, (e) => {
            setRPM(e.rotationRate.gamma, player);
          }));
        }
      })
    } else if (window.DeviceOrientationEvent && isMobile) {
      player.start();
      player.playbackRate = 0;
      setPlaying(true);
      window.addEventListener('devicemotion', throttle(100, (e) => {
        setRPM(e.rotationRate.gamma, player);
      }));
   } else {
      setShowMessage(true);
   }
  }
  return (
    <div className="app">    
      <PlayerComponent 
        url="./Midday.[mp3|ogg]"  
        onload={(player) => {
          setPlayer(player)
        }} 
        loop/>  
      <img className={`vinyl-image center ${player ? '' :'loading'}`} src="/man.jpg" />
      <div className="vinyl-dot center" />
      {x}
    { !player && <Loader
         type="Puff"
         className="center"
         color="#00BFFF"
         height={350}
         width={350}
      />}
    { player && !playing  && <button className="center" onClick={activateListener}> Get Started</button>}
    {playing && <div className="center message">
      <Rotate className="rotate rotating-svg"></Rotate>
      Make sure your phone is in silent mode and rotate the phone to hear the song play</div>}

    {showMessage && <div className="center message">Looks like your device does not support the <a href="https://caniuse.com/#feat=deviceorientation">Device Motion event</a>. <br/>Please try again with a mobile device</div>}
    </div>
  );
}

const PlayerComponent = (props) => {
  useEffect(() => {
    const player = new Player({
      onload: () => props.onload(player),
      'url': props.url,
      'loop': props.loop,
    }).toMaster();
  },[]);
  return null;
}

export default App;
