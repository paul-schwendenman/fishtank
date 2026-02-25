export class SpatialHash<T> {
  private cells = new Map<string, T[]>();
  private cellSize: number;

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }

  private key(col: number, row: number): string {
    return `${col},${row}`;
  }

  insert(item: T, x: number, y: number): void {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    const k = this.key(col, row);
    const cell = this.cells.get(k);
    if (cell) {
      cell.push(item);
    } else {
      this.cells.set(k, [item]);
    }
  }

  query(x: number, y: number, radius: number): T[] {
    const results: T[] = [];
    const minCol = Math.floor((x - radius) / this.cellSize);
    const maxCol = Math.floor((x + radius) / this.cellSize);
    const minRow = Math.floor((y - radius) / this.cellSize);
    const maxRow = Math.floor((y + radius) / this.cellSize);

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const cell = this.cells.get(this.key(col, row));
        if (cell) {
          for (const item of cell) {
            results.push(item);
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
