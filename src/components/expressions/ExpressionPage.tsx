"use client";
import { useState } from "react";
import { Expression } from "../../expressions/Expression";
import { ExpressionTree } from "./ExpressionTree";
import { IExprItem } from "../../expressions/BaseExpr";
import { HighlightableInput } from "./HighlightableInput";
import { IToken, lexer, Token } from "../../expressions/Lexer";
import { Tokens } from "./Tokens";
import { expectations } from "../../expressions/expressions.expectations";

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

export function ExpressionPage() {
  const { value, tokens, expression, setValue } = useExpression();
  const [highLightInputItem, setHighlightedInputItem] = useState<
    IExprItem | undefined
  >(undefined);
  const [highLightParseItem, setHighlightedExpressionItem] = useState<
    IExprItem | undefined
  >(undefined);
  const [highLightTokenIndex, setHighlightedTokenIndex] = useState<
    number | undefined
  >(undefined);

  return (
    <>
      <h2>String Parsing</h2>

      <p>
        Test Expressions:&nbsp;
        <select
          onChange={(e) => {
            if (!expectations) return;
            const str = e.target.value;
            if (str === undefined) return;
            setValue(str);
          }}
        >
          <optgroup label="Valid">
            {expectations
              ?.filter(([_, expectation]) => !expectation.error)
              .map(([expr, expectation], index) => (
                <option key={expr} value={expr}>
                  {expr}
                </option>
              ))}
          </optgroup>
          <optgroup label="Invalid">
            {expectations
              ?.filter(([_, expectation]) => expectation.error)
              .map(([expr, expectation], index) => (
                <option key={expr} value={expr}>
                  {expr}
                </option>
              ))}
          </optgroup>
        </select>
      </p>

      <HighlightableInput
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
        }}
        onHover={(index) => {
          setHighlightedTokenIndex(index);
          const hoveringItems = expression.getAtIndex(index);
          const childItem = hoveringItems?.[0];
          setHighlightedExpressionItem(childItem);
        }}
        spellCheck="false"
        style={{ fontFamily: "monospace", width: "100%", lineHeight: "1.5em" }}
        highlightRegion={highLightInputItem}
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
        highlightIndex={highLightTokenIndex}
        onHover={(hoveredItem) => {
          setHighlightedInputItem(hoveredItem);
        }}
      />

      <h2>Expression Tree</h2>
      <ExpressionTree
        input={value}
        highLightItem={highLightParseItem}
        expression={expression.ast}
        onHover={(hoveredItem) => {
          setHighlightedInputItem(hoveredItem);
        }}
      />
    </>
  );
}
