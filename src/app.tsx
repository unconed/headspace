import { Library, Track } from './track/types';

import React, { CSSProperties, ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import LIBRARY from './library.json';

import { useAudioPlayback } from './components/audio';
import { XYPanel } from './components/xy-panel';

type Parameters = {
  activity: number,
  hazard: number
};

const INITIAL = { activity: 0.5, hazard: 0.5 };
const NO_POINTS = [] as [number, number][];

const DRIFT_RATIO = 0.05;
const DRIFT_MEAN = 10000;
const DRIFT_SPREAD = 2000;

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const lerp  = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export const App = () => {
  const [startTime] = useState<number>(Date.now);

  const [{tracks}] = LIBRARY as any as Library[];
  const [track, setTrack] = useState<number>(0);
  const currentTrack = tracks[track];

  const [parameters, setParameters] = useState<Parameters>(INITIAL);
  const {activity, hazard} = parameters;
  const setActivity = (activity: number) => setParameters((p: Parameters) => ({...p, activity}));
  const setHazard   = (hazard: number)   => setParameters((p: Parameters) => ({...p, hazard}));

  const [drift, setDrift] = useState<boolean>(false);
  useEffect(() => {
    if (!drift) return;

    let running = true;
  
    let at = activity, a1 = activity, a2 = activity, a3 = activity;
    let ht = hazard, h1 = hazard, h2 = hazard, h3 = hazard;
  
    let nextT = 0;
    let frame = 0;

    const loop = () => {
      if (running) requestAnimationFrame(loop);

      frame = (frame + 1) % 10;
      if (frame) return;

      const t = Date.now() - startTime;

      if (drift) {
        if (t > nextT) {
          nextT = t + DRIFT_MEAN + DRIFT_SPREAD * (Math.random() * 2 - 1);

          at = Math.random();
          ht = Math.random();
        }

        a1 = clamp(lerp(a1, at, DRIFT_RATIO), 0, 1);
        a2 = clamp(lerp(a2, a1, DRIFT_RATIO), 0, 1);
        a3 = clamp(lerp(a3, a2, DRIFT_RATIO), 0, 1);
        h1 = clamp(lerp(h1, ht, DRIFT_RATIO), 0, 1);
        h2 = clamp(lerp(h2, h1, DRIFT_RATIO), 0, 1);
        h3 = clamp(lerp(h3, h2, DRIFT_RATIO), 0, 1);
    
        setParameters({ activity: a3, hazard: h3 });
      }
    }
    requestAnimationFrame(loop);
    return () => { running = false };
  }, [drift]);

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

  const selectTrack = (e: ChangeEvent<HTMLSelectElement>) => setTrack(+e.target.value);
  const options = tracks.map((t: Track, i: number) => <option key={'' + i} value={'' + i}>{t.name}</option>);

  return (
    <div className="ui">
      <div className="row bar flex">
        <select value={'' + track} className="item" onChange={selectTrack}>{options}</select>
        {!isPlaying ? <button onClick={playback.play}>Play</button> : null}
        {isPlaying ? <button onClick={playback.pause}>Pause</button> : null}
        <div className="drift">
          <input type="checkbox" value="1" checked={drift} onChange={(e) => setDrift(e.target.checked)} /> Drift
        </div>
      </div>
      <div className="relative">
        <div className="label x-label">Activity ▶︎</div>
        <div className="label y-label">Hazard ▶︎</div>
        <div className="row">
          <XYPanel x={activity} y={hazard} setX={setActivity} setY={setHazard} points={points ?? NO_POINTS} />
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

