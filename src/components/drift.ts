import { Dispatch, SetStateAction, useRef, useState, useEffect } from 'react';
import { Parameters } from '../track/types';

const rnd = () => Math.random();

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp  = (a: number, b: number, t: number) => a * (1 - t) + b * t;

const DRIFT_RATIO = 0.05;
const DRIFT_MEAN = 10000;
const DRIFT_SPREAD = 2000;

export const useDrift = (drift: boolean, parameters: Parameters, setParameters: Dispatch<SetStateAction<Parameters>>) => {
  const paramRef = useRef<Parameters>(parameters);
  paramRef.current = parameters;

  const [startTime] = useState<number>(Date.now);
  useEffect(() => {
    if (!drift) return;
    let timer = null as any;
    let nextT = 0;

    const {activity, hazard} = paramRef.current;    
    let at = activity, a1 = activity, a2 = activity, a3 = activity;
    let ht = hazard, h1 = hazard, h2 = hazard, h3 = hazard;

    const loop = () => {
      const t = Date.now() - startTime;

      const {activity, hazard} = paramRef.current;    
      if (activity !== a3) {
        h2 = a3 = activity;
        a1 = rnd(); 
      }
      if (hazard !== h3) {
        h2 = h3 = hazard;
        h1 = rnd();
      }

      if (drift) {
        if (t > nextT) {
          nextT = t + DRIFT_MEAN + DRIFT_SPREAD * (Math.random() * 2 - 1);

          at = rnd() * rnd();
          ht = rnd() * rnd();
          if (rnd() < 0.5) at = 1 - at;
          if (rnd() < 0.5) ht = 1 - ht;
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
    timer = setInterval(loop, 250);

    return () => { clearInterval(timer); };
  }, [drift]);
}