import { describe, expect, test } from "vitest";
import { lexer } from "./Lexer";
import tests from "../../private/expressions.json";

describe("lexer", () => {
  const expressions = tests as [
    expression: string,
    expected: {
      items: any[];
      error?: SyntaxError;
    }
  ][];

  test.for(expressions.slice(0, 99))("input: '%s'", ([expr, expected]) => {
    const tokens = lexer(expr, undefined);
    console.log(expr, [...tokens]);
  });
});