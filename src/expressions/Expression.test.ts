import { describe, expect, test } from "vitest";
import { expectations } from "./expressions.expectations";
import { Parser } from "./Parser";
import { Expression } from "./Expression";

describe("expression", () => {
  test.for(expectations.slice(1, 99))(
    "Parsing '%s' should return error if invalid",
    ([expr, expected]) => {
      const { error } = new Parser(expr);

      expect(
        !!error,
        expected.error
          ? "Error expected"
          : `No error expected but got: ${error?.message}`
      ).toBe(!!expected.error);
    }
  );

  test.for(expectations.slice(1, 99))(
    "Parsing '%s' should return correct error code",
    ([expr, expected]) => {
      const { error } = new Parser(expr);

      expect(error?.code).toBe(expected.error?.code);
    }
  );

  test.for(expectations.slice(1, 99))(
    "Parsing '%s' should return correct error location",
    ([expr, expected]) => {
      const { error } = new Parser(expr);

      expect(error?.start, "error.start").toBe(expected.error?.start);
      expect(error?.end, "error.end").toBe(expected.error?.end);
    }
  );

  test.for(expectations.slice(1, 99))(
    "Parsing '%s' should return correct AST",
    ([expr, expected]) => {
      const { expression } = new Parser(expr);

      expect(expression).toEqual(expected.expression);
    }
  );

  /*
   * Generate custom snapshot
   * rename skip to only
   */

  test.skip("build expectations", () => {
    console.log(
      JSON.stringify(
        expectations.map(([expr]) => {
          const { expression, error } = new Parser(expr);
          return [
            expr,
            {
              expression,
              error,
            },
          ];
        })
      )
    );
    console.log("COPY THIS TO: 'expressions.expectations.ts'");
  });
});
