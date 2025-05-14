"use client";
import { IExprItem } from "../../expressions/BaseExpr";

export function ExpressionItem({
  input,
  item,
  onHover,
}: {
  input: string;
  item: IExprItem;
  onHover?: (isEnter: boolean) => void;
}) {
  return (
    <div
      style={{ padding: "0.5em 0", cursor: "pointer" }}
      onPointerEnter={() => {
        onHover?.(true);
      }}
      onPointerLeave={() => {
        onHover?.(false);
      }}
    >
      {item.type}:{" "}
      <code
        style={{
          whiteSpace: "pre",
          background: "#eee",
          padding: "0.2rem",
          borderRadius: "2px",
          border: "1px solid #ccc",
        }}
      >
        {input.slice(item.start, item.end + 1)}
      </code>{" "}
      ({item.start}, {item.end})
    </div>
  );
}
