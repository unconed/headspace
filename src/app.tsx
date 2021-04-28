import { Album, Track } from './track/types';

import React, { CSSProperties, ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import ALBUMS from './albums.json';

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
const toKey = (i: number) => `${i++}`;

const albums = ALBUMS as any as Album[];
const trackList = albums.flatMap((a: Album) =>
  a.tracks.map((t: Track) => [a, t])
) as [Album, Track][];

let k = 0;
const trackOptions = albums.map((a: Album, i: number) =>
  <optgroup key={toKey(i)} label={a.meta.name}>{
    a.tracks.map((t: Track, j: number) => <option key={toKey(j)} value={toKey(k++)}>{t.meta.name}</option>)
  }</optgroup>
);

export const App = () => {
  const [track, setTrack] = useState<number>(0);
  const [currentAlbum, currentTrack] = trackList[track];

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
    setTrack((t: number) => (t + 1) % trackList.length);
  };

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playback  = useAudioPlayback(currentAlbum, currentTrack, parameters, isPlaying, setIsPlaying, onEnded);

  const {points} = currentTrack;
  const levels = evaluateTrack(currentTrack, parameters, false);

  const selectTrack = (e: ChangeEvent<HTMLSelectElement>) => {
    const t = +e.target.value;
    if (!IS_SAFARI) return setTrack(t);
    // Webaudio is broken in Safari, playback is silently aborted if we immediately play the new track.
    // Pause on each track change as a workaround.
    playback.pause();
    setTimeout(() => setTrack(t), 33);
  }

  const {id, art} = currentAlbum;
  const artURL = art ? `music/${id}/${art}` : null;

  return (<>
    <div className="art">
      {artURL ? <iframe className="art" src={artURL} /> : null}
    </div>
    <div className="ui">
      <div className="row bar menu flex">
        {!isPlaying ? <button className="play" onClick={playback.play} aria-label="play"><span className="symbol" /></button> : null}
        {isPlaying ? <button className="pause" onClick={playback.pause} aria-label="pause"><span className="symbol" /></button> : null}

        <select value={'' + track} className="item" onChange={selectTrack}>{trackOptions}</select>

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
        <p><small>Music by {currentAlbum.meta?.artist ?? '-'}.</small><br />
        <small>Code by <a target="_blank" href="https://acko.net/">unconed</a>. Music extracted using <a target="_blank" href="https://vgmstream.org">VGMStream</a>. Thanks to <a href="https://github.com/hcs64/ww2ogg">hcs</a>.</small></p>
        <p className="tc"><small><a href="https://github.com/unconed/headspace" target="_blank">Github Repo</a></small></p>
      </div>
    </div>
    <div className="vscode">
      <a target="_blank" href="https://marketplace.visualstudio.com/items?itemName=StevenWittens.vscode-headspace">
        <img src="images/vscode-400.png" title="Headspace for VSCode" /><br />
        Visual Studio <br />
        Code Plug-in
      </a>
    </div>
  </>);
};

