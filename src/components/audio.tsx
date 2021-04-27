import React, { useEffect, useMemo, useState } from 'react';
import { Parameters, Track, Album } from '../track/types';
import { makePlayback } from '../track/audio';

export const useAudioPlayback = (
  album: Album,
  track: Track,
  parameters: Parameters,
  startsPlaying: boolean,
  setIsPlaying: (b: boolean) => void,
  onEnded: () => void,
) => {
  const playback = useMemo(() => {
    const onPing = () => setIsPlaying(playback.isPlaying());
    return makePlayback(album, track, startsPlaying, onPing, onPing, onEnded);
  }, [track]);

  playback.setParameters(parameters);

  useEffect(() => {
    return () => playback.dispose();
  }, [playback]);

  return playback;
};
