import React, { useEffect, useMemo, useState } from 'react';
import { Parameters, Track, Library } from '../track/types';
import { makePlayback } from '../track/audio';

export const useAudioPlayback = (
  library: Library,
  track: Track,
  parameters: Parameters,
  isPlaying: boolean,
  setIsPlaying: (b: boolean) => void,
  onEnded: () => void,
) => {
  const playback = useMemo(() => {
    const onPing = () => setIsPlaying(playback.isPlaying());
    return makePlayback(library, track, isPlaying, onPing, onPing, onEnded);
  }, [track]);

  playback.setParameters(parameters);

  useEffect(() => {
    return () => playback.dispose();
  }, [playback]);

  return playback;
};
