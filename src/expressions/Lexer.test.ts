import { describe, expect, test } from "vitest";
import { lexer } from "./Lexer";
import { expectations } from "./expressions.expectations";

describe("lexer", () => {
  test.for(expectations.slice(0, 99))("input: '%s'", ([expr, expected]) => {
    const tokens = lexer(expr, undefined);
    // console.log(expr, [...tokens]);
  });
});
