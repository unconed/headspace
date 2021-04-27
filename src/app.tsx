import { Library, Track } from './track/types';

import React, { CSSProperties, ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import LIBRARY from './library.json';

import { evaluateTrack } from './track/track';
import { useAudioPlayback } from './components/audio';
import { XYPanel } from './components/xy-panel';
import { useDrift } from './components/drift';
import { useListen } from './components/listen';

const IS_SAFARI = (!window.AudioContext && (window as any).webkitAudioContext);

type Parameters = {
  activity: number,
  hazard: number
};

const INITIAL = { activity: 0.5, hazard: 0.5 };
const NO_POINTS = [] as [number, number][];

export const App = () => {
  const [{tracks}] = LIBRARY as any as Library[];
  const [track, setTrack] = useState<number>(0);
  const currentTrack = tracks[track];

  const [parameters, setParameters] = useState<Parameters>(INITIAL);
  const {activity, hazard} = parameters;
  const setActivity = (activity: number) => setParameters((p: Parameters) => ({...p, activity}));
  const setHazard   = (hazard: number)   => setParameters((p: Parameters) => ({...p, hazard}));

  const [drift, setDrift] = useState<boolean>(false);
  useDrift(drift, parameters, setParameters);
  const [controlled, connected] = useListen(parameters, setParameters);

  const onPlaying = (b: boolean) => {
    setIsPlaying(b);
  };
  const onEnded = () => {
    setIsPlaying(true);
    setTrack((t: number) => (t + 1) % tracks.length);
  };

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playback  = useAudioPlayback(currentTrack, parameters, isPlaying, setIsPlaying, onEnded);

  const {points} = currentTrack;
  const levels = evaluateTrack(currentTrack, parameters, false);

  const selectTrack = (e: ChangeEvent<HTMLSelectElement>) => {
    const t = +e.target.value;
    if (!IS_SAFARI) return setTrack(t);
    // Webaudio is broken in Safari, playback is silently aborted
    playback.pause();
    setTimeout(() => setTrack(t), 33);
  }
  const options = tracks.map((t: Track, i: number) => <option key={'' + i} value={'' + i}>{t.name}</option>);

  return (
    <div className="ui">
      <div className="row bar menu flex">
        {!isPlaying ? <button className="play" onClick={playback.play} aria-label="play"><span className="symbol" /></button> : null}
        {isPlaying ? <button className="pause" onClick={playback.pause} aria-label="pause"><span className="symbol" /></button> : null}

        <select value={'' + track} className="item" onChange={selectTrack}>{options}</select>

        <div className="drift">
          {!controlled ?
              <label>
                <input
                  disabled={controlled}
                  type="checkbox" 
                  value="1"
                  checked={drift}
                  onChange={(e) => setDrift(e.target.checked)}
                />
                Drift
              </label>
          : null}
          {controlled ? (connected
            ? <span className="connected" title="Connected"></span >
            : <span className="spinner" title="Connecting to Event Source"></span>
           ) : null}
        </div>
      </div>
      <div className="relative">
        <div className="label x-label">Activity ▶︎</div>
        <div className="label y-label">Hazard ▶︎</div>
        <div className="row">
          <XYPanel x={activity} y={hazard} setX={setActivity} setY={setHazard} points={points ?? NO_POINTS} levels={levels} />
        </div>
      </div>
      <div className="row bar info">
        <p>A recreation of the dynamic helmet soundtrack from <a target="_blank" href="https://hardspace-shipbreaker.com/">Hardspace Shipbreaker</a> by  <a target="_blank" href="https://blackbirdinteractive.com/">Blackbird Interactive</a>.</p>
        <p>Move the red dot to change the tension.</p>
        <p><small>Music by Jono Grant, Traz Damji, Philip J Bennett, Ben McCullough.</small></p>
        <p><small>Code by <a target="_blank" href="https://acko.net/">unconed</a>. Music extracted using <a target="_blank" href="https://vgmstream.org">VGMStream</a>. Thanks to <a href="https://github.com/hcs64/ww2ogg">hcs</a>.</small></p>
      </div>
      
    </div>
  );
};

