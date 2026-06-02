export const M = 2;
export const B = 256;
export const K = 24;
export const LR = 0.012;
export const BETA1 = 0.9;
export const BETA2 = 0.999;
export const EPS = 1e-8;
export const INIT_RANGE = 0.12;
export const REP_THRESHOLD = 0.32;

export type Matrix2xN = [number[], number[]];

export type ModelParams = {
  W: Matrix2xN;
  b: number[];
};

export type StepOutput = ModelParams & {
  loss: number;
};
