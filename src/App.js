import React, {useState, useEffect} from 'react';
import { throttle, debounce } from 'throttle-debounce';
import { Player } from 'tone';
import './App.css';
let player
function App() {
  const [x, setX] = useState(0);
  const [initialized, setInitialized] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(45);
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

    //player.autostart = true;
    if (DeviceMotionEvent.requestPermission) {
      DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response == 'granted') {
          window.addEventListener('devicemotion', throttle(25, (e) => {
            const angularVelocity = e.rotationRate.alpa
            const radiansPerSecond = angularVelocity * Math.PI/180;
            const revolutionsPerSecond = radiansPerSecond / (2 * Math.PI * (180/Math.PI));
            const rpm =  Math.round(e.rotationRate.gamma * 60 / 360);
            setX(rpm)
          }))
        }
      })
   } else {
    setShowMessage(true);
   }
  }
  const handleInputChange = throttle(500, (event) => setPlaybackRate(event.target.value))
  return (
    <div className="App">      
      <button disabled={!initialized} onClick={activateListener}> Press ME</button>
      <input onInput={handleInputChange} type="range" min="0" max="45" value={playbackRate} />
      {x}
    {showMessage && <div>Looks like your device does not support the Device Motion event. Please try again with a mobile device</div>}
    </div>
  );
}

const PhoneSensor = (props) => {
  

}

export default App;
