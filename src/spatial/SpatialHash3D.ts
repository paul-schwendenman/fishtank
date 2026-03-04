export class SpatialHash3D<T> {
  private cells = new Map<string, T[]>();
  private cellSize: number;

  constructor(cellSize: number = 20) {
    this.cellSize = cellSize;
  }

  private key(col: number, row: number, layer: number): string {
    return `${col},${row},${layer}`;
  }

  insert(item: T, x: number, y: number, z: number): void {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    const layer = Math.floor(z / this.cellSize);
    const k = this.key(col, row, layer);
    const cell = this.cells.get(k);
    if (cell) {
      cell.push(item);
    } else {
      this.cells.set(k, [item]);
    }
  }

  query(x: number, y: number, z: number, radius: number): T[] {
    const results: T[] = [];
    const minCol = Math.floor((x - radius) / this.cellSize);
    const maxCol = Math.floor((x + radius) / this.cellSize);
    const minRow = Math.floor((y - radius) / this.cellSize);
    const maxRow = Math.floor((y + radius) / this.cellSize);
    const minLayer = Math.floor((z - radius) / this.cellSize);
    const maxLayer = Math.floor((z + radius) / this.cellSize);

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        for (let layer = minLayer; layer <= maxLayer; layer++) {
          const cell = this.cells.get(this.key(col, row, layer));
          if (cell) {
            for (const item of cell) {
              results.push(item);
            }
          }
        }
      }
    }
    return results;
  }

  clear(): void {
    this.cells.clear();
  }
}
