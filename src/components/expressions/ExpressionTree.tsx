"use client";
import { IExprItem } from "../../expressions/BaseExpr";
import { Expression } from "../../expressions/Expression";
import { ExpressionItem } from "./ExpressionItem";

export function ExpressionTree({
  expression,
  onHover,
}: {
  expression: Expression | undefined;
  onHover?: (item: IExprItem | undefined) => void;
}) {
  if (!expression) return null;
  return (
    <div className="expression-tree">
      {expression.items.map((item) => (
        <ExpressionItem
          key={`${item.start}-${item.end}`}
          item={item}
          onHover={(isEnter) => {
            onHover?.(isEnter ? item : undefined);
          }}
        />
      ))}
    </div>
  );
}
