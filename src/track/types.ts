export type Filename = string;
export type Variable = string;

export type Parameters = Record<string, number>;

export type Album = {
  id: string,
  meta: {
    name: string,
    artist: string,
  },
  art: string,
  tracks: Track[],
};

export type Track = {
  meta: {
    name: string,
  },
  files: Filename[],
  inputs: Variable[],
  gains?: number[],
  delays?: number[],
  points?: [number, number][],
  expr: AST,
};

export type AST =
  ["add", AST, AST] |
  ["mul", AST, AST] |
  ["lerp", AST, AST, AST] |
  ["mix", AST, AST, AST] |
  ["input", string] |
  ["input", string, number, number] |
  ["input", string, number, number, number, number] |
  ["track", number];