import { useState, useEffect } from "react";
import { Player } from "tone";

let buffers = [];
let reversedBuffers = [];

const usePlayer = (url, loop, onload) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const tonePlayer = new Player({
      onload: () => {
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
