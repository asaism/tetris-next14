export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Board = CellValue[][];

export interface Piece {
  shape: number[][];
  color: number;
}

export interface Position {
  x: number;
  y: number;
}
