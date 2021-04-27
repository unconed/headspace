import { Dispatch, SetStateAction, useRef, useState, useEffect } from 'react';
import { Parameters } from '../track/types';

const DEFAULT_LERP_FACTOR = 0.1;
const INTERVAL_TIME = 150;

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp  = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export const useListen = (parameters: Parameters, setParameters: Dispatch<SetStateAction<Parameters>>) => {
  const paramRef = useRef<Parameters>(parameters);
  paramRef.current = parameters;

  const {hash} = location;
  const match = hash.match(/^#listen=([^&]+)(&|$)/);

  const controlled = !!match;
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!match) return;
    let timer = null as any;
    let factor = DEFAULT_LERP_FACTOR;

    const url = match[1];
    const eventSource = new EventSource(url);
    eventSource.onopen = () => setConnected(true);
    eventSource.onmessage = (e: any) => {
      try {
        const p = JSON.parse(e.data);
        at = p.activity ?? 0.5;
        ht = p.hazard ?? 0.5;
        factor = (1 / (1000/INTERVAL_TIME * p.time)) || DEFAULT_LERP_FACTOR;
      } catch (e) {
        console.error("Failed to process message", e.data);
      }
    };
    const activity = 0.5;
    const hazard = 0.5;
        
    let at = activity, a1 = activity, a2 = activity, a3 = activity;
    let ht = hazard, h1 = hazard, h2 = hazard, h3 = hazard;
    let speed = 0.01;

    const loop = () => {
      const {activity, hazard} = paramRef.current;    
      if (activity !== a3) {
        at = a1 = a2 = a3 = activity;
      }
      if (hazard !== h3) {
        ht = h1 = h2 = h3 = hazard;
      }

      a1 = clamp(lerp(a1, at, factor), 0, 1);
      a2 = clamp(lerp(a2, a1, factor), 0, 1);
      a3 = clamp(lerp(a3, a2, factor), 0, 1);
      h1 = clamp(lerp(h1, ht, factor), 0, 1);
      h2 = clamp(lerp(h2, h1, factor), 0, 1);
      h3 = clamp(lerp(h3, h2, factor), 0, 1);

      setParameters({ activity: a3, hazard: h3 });
      setConnected(eventSource.readyState === 1);
    };
    timer = setInterval(loop, INTERVAL_TIME);

    return () => {
      clearInterval(timer);
      eventSource.onmessage = null;
      eventSource.close();
    };
  }, [hash]);

  return [controlled, connected];
}
