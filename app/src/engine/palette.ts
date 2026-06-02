export const HUES = [
  '#E0A64A',
  '#C9605A',
  '#6FA0C9',
  '#84BE7E',
  '#B584C4',
  '#D8C25A',
];

const POS: [number, number, number] = [224, 166, 74];
const NEG: [number, number, number] = [74, 166, 160];
const REP: [number, number, number] = [216, 180, 106];

export function cellColor(v: number, diag: boolean): string {
  const c = diag ? REP : v >= 0 ? POS : NEG;
  const a = Math.min(1, Math.abs(v));
  return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
}
