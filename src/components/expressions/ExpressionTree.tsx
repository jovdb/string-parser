"use client";
import type { IExprItem } from "../../expressions/BaseExpr";
import { ExpressionItem } from "./ExpressionItem";

export function ExpressionTree({
  input,
  items,
  highLightItem,
  onHover,
}: {
  input: string;
  items: IExprItem<string>[] | undefined;
  highLightItem?: IExprItem | undefined;
  onHover?: (item: IExprItem | undefined) => void;
}) {
  if (!items) return null;
  return (
    <div
      className="expression-tree"
      style={{
        display: "inline-block",
        paddingLeft: "1em",
        marginLeft: "0.25em",
        borderLeft: "2px solid #aaa",
      }}
    >
      {items.map((item) => (
        <ExpressionItem
          key={`item-${item.start}-${item.end}`}
          item={item}
          highLightItem={highLightItem}
          input={input}
          onHover={(item) => {
            onHover?.(item);
          }}
        />
      ))}
    </div>
  );
}
