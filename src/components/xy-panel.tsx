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

const PANEL_STYLE = {
  position: 'relative',
  cursor: 'crosshair',
  width: '302px',
  height: '302px',
  background: "rgba(0, 0, 0, .65)",
  border: "3px solid rgba(255, 220, 0, .75)",
} as CSSProperties;

type XYPanelProps = {
  x: number,
  y: number,
  setX: (x: number) => void,
  setY: (x: number) => void,
  points?: [number, number][],
};

export const XYPanel: React.FC<XYPanelProps> = ({x, y, points, setX, setY}) => {
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

  const bound = useRef<EventListener>();
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    document.addEventListener('mousemove', bound.current = onMouseMove as any as EventListener);
    onMouseMove(e);
  };

  const onMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    document.removeEventListener('mousemove', bound.current);
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
  const addMarker = (key: string, x: number, y: number, color: string) => children.push(
    <div key={key} style={{
      ...MARKER_STYLE,
      left: (x*299) + 'px',
      top:  ((1-y)*299) + 'px',
      backgroundColor: color,
    }} />
  );

  if (points) {
    let i = 0;
    for (let p of points) addMarker(`${++i}`, p[0], p[1], 'rgba(255, 220, 0, 1)');
  }
  addMarker('active', x, y, "#FF0030");

  return (
    <div
      ref={(el) => ref.current = el}
      style={PANEL_STYLE}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {children}
    </div>
  );
}