import React, { useEffect, useMemo, useState } from 'react';
import { Parameters, Track } from '../track/types';
import { makePlayback } from '../track/audio';

export const useAudioPlayback = (
  track: Track,
  parameters: Parameters,
  isPlaying: boolean,
  setIsPlaying: (b: boolean) => void,
  onEnded: () => void,
) => {
  const playback = useMemo(() => {
    const ping = () => setIsPlaying(playback.isPlaying());
    return makePlayback(track, isPlaying, ping, ping, onEnded);
  }, [track]);

  playback.setParameters(parameters);

  useEffect(() => {
    return () => playback.dispose();
  }, [playback]);

  return playback;
};
