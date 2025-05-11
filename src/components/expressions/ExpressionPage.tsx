"use client";
import { useState } from "react";
import { Expression } from "../../expressions/Expression";
import { ExpressionTree } from "./ExpressionTree";
import { IExprItem } from "../../expressions/BaseExpr";
import { HighlightableInput } from "./HighlightableInput";

export function ExpressionPage() {
  const [expression, setExpression] = useState<Expression | undefined>(
    undefined
  );

  const [item, setItem] = useState<IExprItem | undefined>(undefined);

  return (
    <>
      <h2>String Parsing</h2>
      <pre>[V]: variable [F()]: function</pre>
      <HighlightableInput
        value={expression?.value ?? ""}
        onChange={(newValue) => {
          setExpression(new Expression(newValue));
        }}
        spellCheck="false"
        style={{ fontFamily: "monospace", width: "100%" }}
        highlightRegion={
          item && expression?.value.includes(item.value)
            ? { start: item.start, end: item.end }
            : undefined
        }
        // highlightColor="lightblue" // You can customize the color if needed
      />
      <textarea
        style={{ fontFamily: "monospace", width: "100%", border: "none" }}
        readOnly
        disabled
        value={expression?.toConsoleError() ?? ""}
        spellCheck="false"
        tabIndex={-1}
      ></textarea>

      <ExpressionTree
        expression={expression}
        onHover={(hoveredItem) => {
          setItem(hoveredItem);
        }}
      />
    </>
  );
}
