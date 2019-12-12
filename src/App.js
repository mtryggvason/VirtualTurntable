import React, {useState, useEffect} from 'react';
import { throttle, debounce } from 'throttle-debounce';
import { Player } from 'tone';
import { ReactComponent as Rotate } from './svgs/rotate.svg';

import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

import './App.css';
let player
function App() {
  const [x, setX] = useState(0);
  const [player, setPlayer] = useState(false);
  const [playing, setPlaying] = useState(false)
  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    if (player) {
      const playbackRate = Math.abs(x / 45);
      if (Math.abs(playbackRate - player.playbackRate) > 0.05) {
        player.playbackRate = Math.abs(x / 45);
        player.reverse = x > 0
      }
    } 
  }, [x]);

  const activateListener = () => {
 
    //player.autostart = true;
    if (DeviceMotionEvent.requestPermission) {
      player.start();
      setPlaying(true);
      DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response == 'granted') {
          window.addEventListener('devicemotion', throttle(100, (e) => {
            const angularVelocity = e.rotationRate.alpa
            const rpm =  Math.round(e.rotationRate.gamma * 60 / 360);
            setX(rpm);
          }));
        }
      })
   } else if (window.DeviceOrientationEvent) {
      player.start();
      setPlaying(true);
      window.addEventListener('devicemotion', throttle(100, (e) => {
          const angularVelocity = e.rotationRate.alpa
          const rpm =  Math.round(e.rotationRate.gamma * 60 / 360);
          setX(rpm);
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
      Rotate the phone to hear the song play</div>}

    {showMessage && <div className="center message">Looks like your device does not support the <a href="https://caniuse.com/#feat=deviceorientation">Device Motion event</a>. <br/>Please try again with a mobile device</div>}
    </div>
  );
}

const PlayerComponent = (props) => {
  useEffect(() => {
    player = new Player({
      onload: () => props.onload(player),
      'url': props.url,
      'loop': props.loop,
    }).toMaster();
  },[]);
  return null;
}

export default App;
