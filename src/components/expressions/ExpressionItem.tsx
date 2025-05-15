"use client";
import { IExprItem } from "../../expressions/BaseExpr";
import { ExpressionTree } from "./ExpressionTree";

export function ExpressionItem({
  input,
  item,
  onHover,
}: {
  input: string;
  item: IExprItem;
  onHover?: (item: IExprItem | undefined) => void;
}) {
  return (
    <div style={{ padding: "0.5em 0", cursor: "pointer" }}>
      <div
        onPointerEnter={() => {
          onHover?.(item);
        }}
        onPointerLeave={() => {
          onHover?.(undefined);
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
          {item.name ?? item.value} 
        </code>{" "}
        {item.start}, {item.end}
      </div>
      {item.children?.map((child, index) => (
        <div style={{ marginLeft: "1em" }}>
          {index}:{" "}
          <ExpressionTree
            key={`${item.start}-${item.end}`}
            expression={child}
            input={input}
            onHover={(item) => onHover?.(item)}
          />
        </div>
      )) ?? null}
    </div>
  );
}
