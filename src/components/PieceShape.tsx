import { getPieceShape } from "@/lib/solver";
import type { Piece } from "@/lib/types";

type PieceShapeProps = Readonly<{
  piece: Piece;
  rotation?: number;
  flipped?: boolean;
  size?: "small" | "large";
}>;

export function PieceShape({
  piece,
  rotation = 0,
  flipped = false,
  size = "small",
}: PieceShapeProps) {
  const shape = getPieceShape(piece, rotation, flipped);
  const rows: number[] = [];
  const columns: number[] = [];
  for (let y = 0; y < shape.length; y += 1) {
    if (shape[y].some((value) => value === 1)) {
      rows.push(y);
    }
  }
  for (let x = 0; x < shape[0].length; x += 1) {
    if (shape.some((row) => row[x] === 1)) {
      columns.push(x);
    }
  }

  return (
    <span
      className={`piece-shape piece-shape--${size}`}
      style={{
        gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
        gridTemplateRows: `repeat(${rows.length}, 1fr)`,
      }}
      aria-hidden="true"
    >
      {rows.flatMap((y) =>
        columns.map((x) => (
          <span
            className={shape[y][x] === 1 ? "piece-shape__cell" : "piece-shape__cell piece-shape__cell--empty"}
            data-piece={shape[y][x] === 1 ? piece.name : undefined}
            key={`${x}-${y}`}
          />
        )),
      )}
    </span>
  );
}
