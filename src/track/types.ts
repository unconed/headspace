export type Filename = string;
export type Variable = string;
export type ISOTime = string;

export type Parameters = Record<string, number>;

export type Library = {
  id: string,
  name: string,
  artist: string,
  createdAt: ISOTime,
  tracks: Track[],
};

export type Track = {
  name: string,
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