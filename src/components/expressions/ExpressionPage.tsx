"use client";
import { useState } from "react";
import { Expression } from "../../expressions/Expression";
import { ExpressionTree } from "./ExpressionTree";

export function ExpressionPage() {
  const [expression, setExpression] = useState<Expression | undefined>(
    undefined
  );

  return (
    <>
      <h2>String Parsing</h2>
      <pre>[V]: variable [F()]: function</pre>
      <input
        value={expression?.value ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          setExpression(new Expression(value));
        }}
        spellCheck="false"
        style={{ fontFamily: "monospace", width: "100%" }}
      />
      <textarea
        style={{ fontFamily: "monospace", width: "100%", border: "none" }}
        readOnly
        disabled
        value={expression?.toConsoleError() ?? ""}
        spellCheck="false"
        tabIndex={-1}
      ></textarea>

      <ExpressionTree expression={expression} onHover={(item) => {}} />
    </>
  );
}
