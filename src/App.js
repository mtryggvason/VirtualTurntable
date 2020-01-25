import React, { useState, useEffect } from 'react';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

import { throttle } from 'throttle-debounce';
import { isMobile } from 'react-device-detect';
import { Player, Buffer } from 'tone';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import { ReactComponent as Rotate } from './svgs/rotate.svg';
import './App.css';

let reversed = false,
let buffers = [];
let reversedBuffers = [];
/**
 *  Reverse the buffer.
 *  @private
 *  @return {Tone.Buffer} this
 */
Buffer.prototype._reverse = function(){
	if (this.loaded) {
    reversed = !reversed;
    if (reversed) {
      this._buffer.copyToChannel(reversedBuffers[0], 0, 0);
      this._buffer.copyToChannel(reversedBuffers[1], 1, 0);
    } else {
      this._buffer.copyToChannel(buffers[0], 0, 0);
      this._buffer.copyToChannel(buffers[1], 1, 0);
    }
    /*
		for (var i = 0; i < this.numberOfChannels; i++){
      const buffer = this.getChannelData(i)
      copyToChannel(source, channelNumber, startInChannel);
			Array.prototype.reverse.call(buffer);
    }
    */
	}
	return this;
};

if (window.location.protocol != 'https:') {
  window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

const setRPM = (gamma, player) => {
  const rpm =  Math.round(gamma * 60 / 360);
  if (player) {
    const playbackRate = Math.abs(rpm / 45);
    if (Math.abs(playbackRate - player.playbackRate) > 0.05) {
      player.playbackRate = playbackRate;
      player.reverse = rpm > 0
    }
  } 
}

function reducer(state, action) {
  switch (action.type) {
    case 'setPlayer':
      return {
        ...state,
        player: action.payload.player
      };
    case 'playing':
      return {
        ...state,
        playing: true
      };      
    case 'showMessage':
      return {
        ...state,
        showMessage: true
      };
    default:
      throw new Error();
  }
}

const initialState = {
  playing: false,
  player: null,
  showMessage: false
};

function App() {
  const [player, setPlayer] = useState(false);
  const [playing, setPlaying] = useState(false)
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    //setShowMessage(!window.DeviceOrientationEvent || !isMobile);
  });

  const activateListener = async () => {
    player.start();
    player.playbackRate = 1;
    setPlaying(true)
    if (window.DeviceOrientationEvent && isMobile) {
      player.start();
      player.playbackRate = 1;
      setPlaying(true)
      const response = DeviceMotionEvent.requestPermission ? await DeviceMotionEvent.requestPermission() : 'granted';
      if (response === 'granted') {
        const stream = fromEvent(window, 'devicemotion').pipe(throttleTime(100));
        const subscription = stream.subscribe(e => setRPM(e.rotationRate.gamma, player));            
      }
    }
  };
  const reverse = () => {
    player.reverse = !player.reverse
  }
  const devTools = (<>
   <button onClick={reverse}>REVERSE </button>
      <input onChange={(event) => player.playbackRate = event.target.value} step="0.05" type="range" min="0" max="1" class="slider" id="myRange" />)
     </>);

  return (
    <div className="app">    
      <PlayerComponent 
        url="./Midday.[mp3|ogg]"  
        onload={(player) => {
          setPlayer(player)
        }} 
        loop/>  
      <img alt="vinyl" className={`vinyl-image center ${player ? '' :'loading'}`} src="/man.jpg" />
      <div className="vinyl-dot center" />
    { !player && <Loader
         type="Puff"
         className="center"
         color="#00BFFF"
         height={350}
         width={350}
      />}
    { player && !playing  && <button className="center" onClick={activateListener}>Get Started</button>}
    {playing && <div className="center message">
      <Rotate className="rotate rotating-svg"></Rotate>
      <input type="slider" />
      Turn of silent mode and rotate the phone to hear the song play</div>}
    {showMessage && <div className="center message">Looks like your device does not support the <a href="https://caniuse.com/#feat=deviceorientation">Device Motion event</a>. <br/>Please try again with a mobile device</div>}
    </div>
  );
}

const PlayerComponent = (props) => {
  useEffect(() => {
    const player = new Player({
      onload: () => {
        for (var i = 0; i < player._buffer.numberOfChannels; i++) {
          const buffer = player._buffer.getChannelData(i)
          buffers.push(buffer);
          reversedBuffers.push(buffer.slice().reverse())
        }
        props.onload(player)
      },
      'url': props.url,
      'loop': props.loop,
    }).toMaster();
  },[]);
  return null;
}

export default App;
