"use client";
import { IExprItem } from "../../expressions/BaseExpr";
import { ExpressionItem } from "./ExpressionItem";

export function ExpressionTree({
  input,
  expression,
  highLightItem,
  onHover,
}: {
  input: string;
  expression: IExprItem<string>[] | undefined;
  highLightItem?: IExprItem | undefined;
  onHover?: (item: IExprItem | undefined) => void;
}) {
  if (!expression) return null;
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
      {expression?.map((item) => (
        <ExpressionItem
          key={`${item.start}-${item.end}`}
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
