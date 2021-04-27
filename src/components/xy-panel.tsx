import React, { CSSProperties, MouseEvent, TouchEvent, useCallback, useRef } from 'react';

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

const MARKER_STYLE = {
  position: 'absolute',
  width: '13px',
  height: '13px',
  marginLeft: '-8px',
  marginTop: '-8px',
  borderRadius: '100%',
  boxShadow: '0 0 15px rgba(0, 0, 0, .75), 0 0 3px rgba(0, 0, 0, 1)',
} as CSSProperties;

type XYPanelProps = {
  x: number,
  y: number,
  setX: (x: number) => void,
  setY: (x: number) => void,
  points?: [number, number][],
  levels: number[],
};

export const XYPanel: React.FC<XYPanelProps> = ({x, y, points, levels, setX, setY}) => {
  const ref = useRef<HTMLDivElement>();

  const onMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const {buttons, clientX, clientY} = e;
    const el = ref.current;
    if (buttons & 1) {
      if (el) {
        const {left, top} = el.getBoundingClientRect();
        const x = clientX - left - 1;
        const y = clientY - top - 1;
        setX(clamp(x / 299, 0, 1));
        setY(1 - clamp(y / 299, 0, 1));
      }
    }
    e.preventDefault();
  }, [setX, setY]);

  const boundMove = useRef<EventListener>();
  const boundUp   = useRef<EventListener>();
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    document.addEventListener('mousemove', boundMove.current = onMouseMove as any as EventListener);
    document.addEventListener('mouseup', boundUp.current = onMouseUp as any as EventListener);
    onMouseMove(e);
  };

  const onMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    document.removeEventListener('mousemove', boundMove.current);
    document.removeEventListener('mouseup', boundUp.current);
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const touches = e.changedTouches;
    const {clientX, clientY} = touches[0];
    const el = ref.current;
    if (el) {
      const {left, top} = el.getBoundingClientRect();
      const x = clientX - left - 1;
      const y = clientY - top - 1;
      setX(clamp(x / 299, 0, 1));
      setY(1 - clamp(y / 299, 0, 1));
    }
  };

  const children = [] as any[];
  const addMarker = (key: string, x: number, y: number, radius: number, color: string) => children.push(
    <div key={key} style={{
      ...MARKER_STYLE,
      width: radius + 'px',
      height: radius + 'px',
      marginLeft: (-radius / 2 - 1) + 'px',
      marginTop: (-radius / 2 - 1) + 'px',
      left: (x*299) + 'px',
      top:  ((1-y)*299) + 'px',
      backgroundColor: color,
    }} />
  );

  if (points) {
    let i = 0;
    for (let p of points) {
      addMarker(`${i}`, p[0], p[1], 5 + Math.round(20 * levels[i]), 'rgba(255, 255, 255, 1)');
      ++i;
    }
  }
  addMarker('active', x, y, 30, "#FF0030");

  return (
    <div
      ref={(el) => ref.current = el}
      className="xy-panel"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {children}
    </div>
  );
}