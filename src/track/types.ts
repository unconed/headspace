export type Filename = string;
export type Variable = string;

export type Parameters = Record<string, number>;

export type Track = {
  name: string,
  tracks: Filename[],
  inputs: Variable[],
  expr: AST,
};

export type AST =
  ["add", AST, AST] |
  ["mul", AST, AST] |
  ["lerp", AST, AST, AST] |
  ["input", string] |
  ["input", string, number, number] |
  ["input", string, number, number, number, number];

