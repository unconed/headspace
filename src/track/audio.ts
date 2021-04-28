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
    // Lazy init autoContext on gesture, then keep it forever
    // @ts-ignore
    audioContext = audioContext || new (window.AudioContext ?? window.webkitAudioContext)();
    const {destination} = audioContext;

    // Get track delays
    let {delays, files} = track;
    delays = delays || files.map(() => 0);
    const min = delays.reduce((a: number, b: number) => Math.min(a, b), 0);

    // Load track sources
    const tracks = elements.map((el: HTMLAudioElement) => audioContext.createMediaElementSource(el));

    // Gain nodes to control track level
    const gains = [] as any[];

    // Set up audio graph
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

  // Begin playback
  const play = () => {
    // Lazy init
    if (!audioContext) {
      [audioContext, gains] = initContext();
    }

    // If all files loaded
    if (isReady) {
      for (let el of elements) el.play();
    }
    else {
      // Schedule playback
      isPending = true;
    }

    if (onStateChange) onStateChange();
  };

  // End playback
  const pause = () => {
    for (let el of elements) el.pause();
    isPending = false;
    if (onStateChange) onStateChange();
  };

  // Dispose of all resources
  const dispose = () => {
    if (elements) for (let el of elements) el.src = '';
    // @ts-ignore
    elements = gains = [];
    // @ts-ignore
    onLoaded = onStateChange = onEnded = null;
  };

  // Set user-defined audio parameters
  const setParameters = (parameters: Parameters) => {
    if (!audioContext) return;
    const volume = parameters.volume ?? 1;
    const levels = evaluateTrack(track, parameters);
    let i = 0;
    for (let level of levels) {
      gains[i].gain.setTargetAtTime(level * volume * volume, elements[i].currentTime, .01);
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
