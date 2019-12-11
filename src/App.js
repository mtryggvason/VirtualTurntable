import React, {useState, useEffect} from 'react';
import { throttle, debounce } from 'throttle-debounce';
import { Player } from 'tone';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

import './App.css';
let player
function App() {
  const [x, setX] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [playing, setPlaying] = useState(false)
  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    if(player) return;
    player = new Player({
      onload: () => setInitialized(true),
      'url': './Midday.[mp3|ogg]',
      'loop': true,
    }).toMaster();
  })

  useEffect(() => {
  if (player) player.playbackRate = Math.abs(x / 45);
  player.reverse = x < 0
  }, [x]);


  const activateListener = () => {
    player.start();
    setPlaying(true);
    //player.autostart = true;
    if (DeviceMotionEvent.requestPermission) {
      DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response == 'granted') {
          window.addEventListener('devicemotion', throttle(25, (e) => {
            const angularVelocity = e.rotationRate.alpa
            const rpm =  Math.round(e.rotationRate.gamma * 60 / 360);
            setX(rpm)
          }))
        }
      })
   } else {
    setShowMessage(true);
   }
  }
  return (
    <div className="app">      
      <img className={`vinyl-image center ${initialized ? '' :'loading'}`} src="/man.jpg" />
      <div className="vinyl-dot center" />
      {x}
    { !initialized && <Loader
         type="Puff"
         className="center"
         color="#00BFFF"
         height={350}
         width={350}
      />}
    { initialized && !playing  && <button className="center" onClick={activateListener}> Get Started</button>}
    {showMessage && <div className="center message">Looks like your device does not support the <a href="https://caniuse.com/#feat=deviceorientation">Device Motion event</a>. <br/>Please try again with a mobile device</div>}
    </div>
  );
}

const PhoneSensor = (props) => {
  

}

export default App;
