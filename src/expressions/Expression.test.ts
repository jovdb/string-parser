import { describe, expect, test } from "vitest";
import { IExprItem } from "./BaseExpr";
// import { SyntaxError, Expression } from "./expression";
import tests from "../../private/expressions.json";
import { parser } from "./Expression";

describe("expression", () => {
  const expressions = tests as [
    expression: string,
    expected: {
      items: IExprItem[];
      error?: SyntaxError;
    }
  ][];

  test.for(expressions.slice(1, 99))("parse '%s'", ([expr, expected]) => {
    console.log("EXPRESSION:", `'${expr}'`);
    const { ast, error } = parser(expr);

    const actual = {
      items: ast,
      error,
    };

    // expect(actual).toEqual(expected);

    console.log("AST: ", ast, error);
  });
});
