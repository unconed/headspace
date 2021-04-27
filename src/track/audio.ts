import { Parameters, Track, Album } from './types';
import { evaluateTrack } from './track';

// Hold on to audioContext for dear life once granted
let audioContext;

export const loadFiles = (path: string, files: string[]) =>
  files.map((file: string) => {
    const el = document.createElement('audio');
    el.src = `music/${path}/${file}`;
    return el;
  });

export const makePlayback = (
  album: Album,
  track: Track,
  startsPlaying: boolean,
  onLoaded: Function,
  onStateChange: Function,
  onEnded: Function,
) => {
  let audioContext: AudioContext;
  let gains: GainNode[];
  let elements: HTMLAudioElement[];
  let referenceElement: HTMLAudioElement;

  let isReady = false;
  let isPending = startsPlaying;

  const initFiles = (album: Album, track: Track): [HTMLAudioElement[], HTMLAudioElement] => {
    const {id} = album;
    const {files} = track;
    let elements = loadFiles(id, files);
    (window as any).__elements = elements;

    let isLoaded = 0;
    for (let el of elements) {
      el.addEventListener('canplay', () => {
        isLoaded++;
        if (isLoaded === elements.length) {
          isReady = true;
          if (isPending) play();
          if (onLoaded) onLoaded();
        }
      });
    }
    
    const referenceElement = elements.reduce((a: HTMLAudioElement, b: HTMLAudioElement) => a.duration > b.duration ? a : b);
    // @ts-ignore
    if (onEnded) referenceElement.addEventListener('ended', onEnded);

    return [elements, referenceElement];
  };

  const initContext = (): [AudioContext, GainNode[]] => {
    const {delays} = track;

    // Lazy init autoContext on gesture, then keep it forever
    // @ts-ignore
    audioContext = audioContext || new (window.AudioContext ?? window.webkitAudioContext)();
    const {destination} = audioContext;

    const tracks = elements.map((el: HTMLAudioElement) => audioContext.createMediaElementSource(el));
    const min = delays.reduce((a: number, b: number) => Math.min(a, b), 0);

    const gains = [] as any[];

    let i = 0;
    for (let track of tracks) {
      const d = (delays[i] || 0) - min;

      const gain = audioContext.createGain();
      gains.push(gain);
      gain.connect(destination);

      if (d) {
        const delay = audioContext.createDelay(d);
        delay.delayTime.value = d;
        track.connect(delay);
        delay.connect(gain);
      }
      else {
        track.connect(gain);
      }
      ++i;
    }

    return [audioContext, gains];
  };
  
  const play = () => {
    if (!audioContext) {
      [audioContext, gains] = initContext();
    }
    if (isReady) {
      for (let el of elements) el.play();
    }
    else {
      isPending = true;
    }
    if (onStateChange) onStateChange();
  };

  const pause = () => {
    for (let el of elements) el.pause();
    isPending = false;
    if (onStateChange) onStateChange();
  };

  const dispose = () => {
    if (elements) for (let el of elements) el.src = '';
    // @ts-ignore
    elements = gains = [];
    // @ts-ignore
    onLoaded = onStateChange = onEnded = null;
  };
  
  const setParameters = (parameters: Parameters) => {
    if (!audioContext) return;

    const levels = evaluateTrack(track, parameters);
    let i = 0;
    for (let level of levels) {
      gains[i].gain.setTargetAtTime(level, elements[i].currentTime, .01);
      ++i;
    }
  };

  [elements, referenceElement] = initFiles(album, track);

  const [el] = elements;
  let isPlaying = () => el && !el.paused;

  return {
    isPlaying,
    track,
    play,
    pause,
    dispose,
    setParameters,
  };
}
