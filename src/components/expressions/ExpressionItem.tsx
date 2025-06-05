"use client";
import type { IExprItem } from "../../expressions/BaseExpr";
import { ExpressionTree } from "./ExpressionTree";

export function ExpressionItem({
  input,
  item,
  highLightItem,
  onHover,
}: {
  input: string;
  item: IExprItem;
  highLightItem?: IExprItem | undefined;
  onHover?: (item: IExprItem | undefined) => void;
}) {
  return (
    <div
      style={{
        padding: "0.5em 0",
        cursor: "pointer",
      }}
    >
      <div
        onPointerEnter={() => {
          onHover?.(item);
        }}
        onPointerLeave={() => {
          onHover?.(undefined);
        }}
      >
        <span
          style={{
            display: "inline-block",
            marginRight: "1em",
            padding: "0.2rem",
            borderRadius: "2px",
            border: `1px solid ${highLightItem === item ? "#ff9600" : "#ccc"}`,
            color: highLightItem === item ? "#000" : "#888",
            background:
              highLightItem === item ? "rgba(255, 150, 0, 0.5)" : "transparent",
          }}
        >
          {item.type}
        </span>
        <code
          style={{
            whiteSpace: "pre",
            background: "#eee",
            padding: "0.2rem",
            borderRadius: "2px",
            border: "1px solid #ccc",
          }}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(item as any).name ?? (item as any).value}
        </code>{" "}
      </div>

      {item.children && item.children.length > 0 ? (
        <ExpressionTree
          items={item.children}
          input={input}
          highLightItem={highLightItem}
          onHover={(item) => onHover?.(item)}
        />
      ) : null}
    </div>
  );
}
