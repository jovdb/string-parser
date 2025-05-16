"use client";
import { useState } from "react";
import { Expression } from "../../expressions/Expression";
import { ExpressionTree } from "./ExpressionTree";
import { IExprItem } from "../../expressions/BaseExpr";
import { HighlightableInput } from "./HighlightableInput";
import { IToken, lexer, Token } from "../../expressions/Lexer";
import { Tokens } from "./Tokens";

function useExpression() {
  const [{ value, tokens, expression }, setExpression] = useState<{
    value: string;
    tokens: IToken[];
    expression: Expression;
  }>(() => ({
    value: "",
    tokens: [],
    expression: new Expression(""),
  }));

  return {
    value,
    tokens,
    expression,
    setValue(newValue: string) {
      setExpression((prev) => ({
        value: newValue,
        tokens: [...lexer(newValue, undefined)],
        expression: new Expression(newValue),
      }));
    },
  };
}

export function ExpressionPage({
  expressions,
}: {
  expressions?: [string, { items: IExprItem[]; error?: SyntaxError }][];
}) {
  const { value, tokens, expression, setValue } = useExpression();
  const [item, setItem] = useState<IExprItem | undefined>(undefined);

  return (
    <>
      <h2>String Parsing</h2>
      <pre>[V]: variable [F()]: function</pre>

      <p>
        <select
          onChange={(e) => {
            if (!expressions) return;
            const selectedIndex = parseInt(e.target.value, 10);
            const str = expressions?.[selectedIndex]![0];
            if (str === undefined) return;
            setValue(str);
          }}
        >
          {expressions?.map(([expr], index) => (
            <option key={index} value={index}>
              {expr}
            </option>
          ))}
        </select>
      </p>

      <HighlightableInput
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
        }}
        spellCheck="false"
        style={{ fontFamily: "monospace", width: "100%", lineHeight: "1.5em" }}
        highlightRegion={item}
        // highlightColor="lightblue" // You can customize the color if needed
      />

      <textarea
        style={{
          fontFamily: "monospace",
          width: "100%",
          border: "none",
          marginLeft: "0.15em",
        }}
        readOnly
        disabled
        value={expression?.toEditorError() ?? ""}
        spellCheck="false"
        tabIndex={-1}
      ></textarea>

      <h2>Tokens</h2>
      <Tokens
        tokens={tokens}
        input={value}
        onHover={(hoveredItem) => {
          setItem(hoveredItem);
        }}
      />

      <h2>Expression Tree</h2>
      <ExpressionTree
        input={value}
        expression={expression.ast}
        onHover={(hoveredItem) => {
          setItem(hoveredItem);
        }}
      />
    </>
  );
}
