import { Track, Variable, Parameters, AST }  from './types';

type Vec = (x: number) => number[];

export const evaluateTrack = (track: Track, parameters: Parameters, gain: boolean = true) => {
  const { inputs, files, expr, gains } = track;
  const vec = (x: number) => files.map(_ => x);

  let levels = evaluateAST(expr, vec, parameters);
  if (gain && gains) levels = mulV(levels, gains);
  return levels;
}

const upcast = (x: number[] | number, vec: Vec): number[] => typeof x === 'number' ? vec(x) : x;

export const evaluateAST = (ast: AST, vec: Vec, parameters: Parameters): number[] => {
  if (typeof ast === 'number') return vec(ast);

  const [op, a, b, c, d, e] = ast;
  switch (op) {
    case 'add': {
      let aVec = evaluateAST(a as any as AST, vec, parameters);
      let bVec = evaluateAST(b as any as AST, vec, parameters);
      return addV(upcast(aVec, vec), upcast(bVec, vec));
    }

    case 'mul': {
      let aVec = evaluateAST(a as any as AST, vec, parameters);
      let bVec = evaluateAST(b as any as AST, vec, parameters);
      return mulV(upcast(aVec, vec), upcast(bVec, vec));
    }

    case 'lerp': {
      let aVec = evaluateAST(a as any as AST, vec, parameters);
      let bVec = evaluateAST(b as any as AST, vec, parameters);
      let tVec = evaluateAST(c as any as AST, vec, parameters);
      return lerpV(upcast(aVec, vec), upcast(bVec, vec), tVec);
    }

    case 'mix': {
      let aVec = evaluateAST(a as any as AST, vec, parameters);
      let bVec = evaluateAST(b as any as AST, vec, parameters);
      let tVec = evaluateAST(c as any as AST, vec, parameters);
      return mixV(upcast(aVec, vec), upcast(bVec, vec), upcast(tVec, vec));
    }

    case 'input': {
      let val = parameters[a as any as number];

      let min  = b as any as number ?? 0;
      let max  = c as any as number ?? 1;
      let from = d as any as number ?? 0;
      let to   = e as any as number ?? 1;

      const ratio = clamp((val - min) / (max - min), 0, 1);
      val = lerp(from, to, ratio);
      return vec(val);
    }
    
    case 'track': {
      const val = vec(0);
      val[a as any as number] = 1;
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
