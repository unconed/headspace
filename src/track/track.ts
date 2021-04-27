import { Track, Variable, Parameters, AST }  from './types';

type Vec = (x: number) => number[];

export const evaluateTrack = (track: Track, parameters: Parameters) => {
  const { inputs, tracks, expr } = track;
  const vec = (x: number) => tracks.map(_ => x);

  return evaluateAST(expr, vec, parameters);
}

export const evaluateAST = (ast: AST, vec: Vec, parameters: Parameters) => {
  const [op, a, b, c, d, e] = ast;

  switch (op) {
    case 'add': {
      let aVec = evaluateAST(a, vec, parameters);
      let bVec = evaluateAST(b, vec, parameters);
      return addV(aVec, bVec);
    }

    case 'mul': {
      let aVec = evaluateAST(a, vec, parameters);
      let bVec = evaluateAST(b, vec, parameters);
      return mulV(aVec, bVec);
    }

    case 'lerp': {
      let aVec = evaluateAST(a, vec, parameters);
      let bVec = evaluateAST(b, vec, parameters);
      let tVec = evaluateAST(c, vec, parameters);
      return lerpV(aVec, bVec, tVec);
    }

    case 'mix': {
      let aVec = evaluateAST(a, vec, parameters);
      let bVec = evaluateAST(b, vec, parameters);
      let tVec = evaluateAST(c, vec, parameters);
      return mixV(aVec, bVec, tVec);
    }

    case 'input': {
      let val = parameters[a];

      let min  = b ?? 0;
      let max  = c ?? 1;
      let from = d ?? 0;
      let to   = e ?? 1;

      const ratio = clamp((val - min) / (max - min), 0, 1);
      val = lerp(from, to, ratio);
      return vec(val);
    }
    
    case 'track': {
      const val = vec(0);
      val[a] = 1;
      return val;
    }
  }
}

export const addV  = (a: number[], b: number[]) => a.map((x: number, i: number) => x + b[i]);
export const mulV  = (a: number[], b: number[]) => a.map((x: number, i: number) => x * b[i]);
export const lerpV = (a: number[], b: number[], t: number[]) => a.map((x: number, i: number) => lerp(x, b[i], t[i]));
export const mixV  = (a: number[], b: number[], t: number[]) => a.map((x: number, i: number) => Math.sqrt(lerp(sqr(x), sqr(b[i]), t[i])));

export const sqr = (x: number) => x * x;
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const lerp  = (a: number, b: number, t: number) => a * (1 - t) + b * t;
