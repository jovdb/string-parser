"use client";
import { IExprItem } from "../../expressions/BaseExpr";

export function ExpressionItem({
  item,
  onHover,
}: {
  item: IExprItem;
  onHover?: (isEnter: boolean) => void;
}) {
  return (
    <div
      style={{ padding: "0.5em 0" }}
      onPointerEnter={() => {
        onHover?.(true);
      }}
      onPointerLeave={() => {
        onHover?.(false);
      }}
    >
      {item.type}: {item.value} ({item.start}, {item.end})
    </div>
  );
}
