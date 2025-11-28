import { useState, useEffect } from "react";
import { Player } from "tone";

let buffers = [];
let reversedBuffers = [];

const usePlayer = (url, loop, onload) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    console.log("NEW");
    const tonePlayer = new Player({
      onload: () => {
        for (var i = 0; i < tonePlayer._buffer.numberOfChannels; i++) {
          const buffer = tonePlayer._buffer.getChannelData(i);
          buffers.push(buffer.slice());
          reversedBuffers.push(buffer.slice().reverse());
        }
        setPlayer(tonePlayer);
        if (onload) {
          onload(tonePlayer);
        }
      },
      url: url,
      loop: loop,
    }).toDestination();
  }, [url]);

  return player;
};

export default usePlayer;
