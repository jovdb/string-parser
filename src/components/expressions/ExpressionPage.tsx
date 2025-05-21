"use client";
import { useState } from "react";
import { ExpressionTree } from "./ExpressionTree";
import { IEvaluateContext, IExprItem } from "../../expressions/BaseExpr";
import { HighlightableInput } from "./HighlightableInput";
import { IToken, lexer, Token } from "../../expressions/Lexer";
import { Tokens } from "./Tokens";
import { expectations } from "../../expressions/expressions.expectations";
import { Parser } from "../../expressions/Parser";

function useExpression() {
  const [{ value, tokens, parser }, setExpression] = useState<{
    value: string;
    tokens: IToken[];
    parser: Parser;
  }>(() => ({
    value: "",
    tokens: [],
    parser: new Parser(""),
  }));

  return {
    value,
    tokens,
    parser,
    setValue(newValue: string) {
      setExpression((prev) => ({
        value: newValue,
        tokens: [...lexer(newValue, undefined)],
        parser: new Parser(newValue),
      }));
    },
  };
}

export function ExpressionPage() {
  const { value, tokens, parser, setValue } = useExpression();
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
              .map(([expr]) => (
                <option key={`select-${expr}`} value={expr}>
                  {expr}
                </option>
              ))}
          </optgroup>
          <optgroup label="Invalid">
            {expectations
              ?.filter(([_, expectation]) => expectation.error)
              .map(([expr]) => (
                <option key={`select-${expr}`} value={expr}>
                  {expr}
                </option>
              ))}
          </optgroup>
        </select>
      </p>

      <div style={{ display: "flex", gap: "0.5em" }}>
        <HighlightableInput
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          onHover={(index) => {
            setHighlightedTokenIndex(index);
            const hoveringItems = parser.getAtIndex(index);
            const childItem = hoveringItems?.[0];
            setHighlightedExpressionItem(childItem);
          }}
          spellCheck="false"
          style={{
            fontFamily: "monospace",
            width: "100%",
            lineHeight: "1.5em",
          }}
          highlightRegion={highLightInputItem}
          // highlightColor="lightblue" // You can customize the color if needed
        />
        <button
          onClick={async () => {
            const context: IEvaluateContext = {
              variables: {
                V1: () => "1",
                V2: async () => "2",
              },
              functions: {
                Date: async () => {
                  return new Date().toISOString();
                },

                Sum: (...args: string[]) => {
                  const numbers = args.map((arg) =>
                    arg ? parseFloat(arg) : 0
                  );
                  numbers.forEach((num, index) => {
                    if (isNaN(num)) {
                      throw new Error(`Argument ${index + 1}: Invalid number`);
                    }
                  });
                  return `${numbers.reduce((acc, curr) => acc + curr, 0)}`;
                },
              },
            };

            let hasError = false;
            const value = await parser.expression.evaluate(context, (error) => {
              hasError = true;
              alert(`ERROR: ${JSON.stringify(error)}`);
            });
            if (hasError) return;
            alert(value);
          }}
        >
          Execute
        </button>
      </div>

      <textarea
        style={{
          fontFamily: "monospace",
          width: "100%",
          border: "none",
          marginLeft: "0.15em",
          background: "transparent",
          color: "red",
        }}
        readOnly
        disabled
        value={parser?.toEditorError() ?? ""}
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
        items={parser.expression.children}
        onHover={(hoveredItem) => {
          setHighlightedInputItem(hoveredItem);
        }}
      />
    </>
  );
}
