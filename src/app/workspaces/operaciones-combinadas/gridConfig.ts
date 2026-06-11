export interface GridVec2 {
  x: number;
  y: number;
}

export interface GridConfig {
  containerPosition: GridVec2;
  gridSize: GridVec2;
  cellSize: GridVec2;
  spacing: GridVec2;
}

export const GRID_CONFIG: GridConfig = {
  containerPosition: { x: 0, y: 0 },
  gridSize: { x: 11, y: 11 },
  cellSize: { x: 86, y: 86 },
  spacing: { x: 0, y: 0 },
};

export const GRID_PIXEL_SIZE: GridVec2 = {
  x:
    GRID_CONFIG.gridSize.x * GRID_CONFIG.cellSize.x +
    (GRID_CONFIG.gridSize.x - 1) * GRID_CONFIG.spacing.x,
  y:
    GRID_CONFIG.gridSize.y * GRID_CONFIG.cellSize.y +
    (GRID_CONFIG.gridSize.y - 1) * GRID_CONFIG.spacing.y,
};

export const GRID_CELL_COUNT = GRID_CONFIG.gridSize.x * GRID_CONFIG.gridSize.y;

export const GRID_GAP_PERCENT: GridVec2 = {
  x: GRID_PIXEL_SIZE.x ? (GRID_CONFIG.spacing.x / GRID_PIXEL_SIZE.x) * 100 : 0,
  y: GRID_PIXEL_SIZE.y ? (GRID_CONFIG.spacing.y / GRID_PIXEL_SIZE.y) * 100 : 0,
};

export const INITIAL_TRAY: string[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "+",
  "-",
  "*",
  "/",
  "=",
  "9",
];
