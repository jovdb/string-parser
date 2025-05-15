"use client";
import { IExprItem } from "../../expressions/BaseExpr";
import { ExpressionItem } from "./ExpressionItem";

export function ExpressionTree({
  input,
  expression,
  onHover,
}: {
  input: string;
  expression: IExprItem<string>[] | undefined;
  onHover?: (item: IExprItem | undefined) => void;
}) {
  if (!expression) return null;
  return (
    <div className="expression-tree" style={{ margin: 10}}>
      {expression?.map((item) => (
        <ExpressionItem
          key={`${item.start}-${item.end}`}
          item={item}
          input={input}
          onHover={(isEnter) => {
            onHover?.(item);
          }}
        />
      ))}
    </div>
  );
}
