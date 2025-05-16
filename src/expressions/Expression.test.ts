import { describe, expect, test } from "vitest";
import { expectations } from "./expressions.expectations";
import { Expression, parser } from "./Expression";

describe("expression", () => {
  test.for(expectations.slice(1, 99))(
    "Parsing '%s' should return error if invalid",
    ([expr, expected]) => {
      const { error } = new Expression(expr);

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
      const { error } = new Expression(expr);

      expect(error?.code).toBe(expected.error?.code);
    }
  );

  test.for(expectations.slice(1, 99))(
    "Parsing '%s' should return correct error location",
    ([expr, expected]) => {
      const { error } = new Expression(expr);

      expect(error?.start, "error.start").toBe(expected.error?.start);
      expect(error?.end, "error.end").toBe(expected.error?.end);
    }
  );

  test.for(expectations.slice(1, 99))(
    "Parsing '%s' should return correct AST",
    ([expr, expected]) => {
      const { ast } = new Expression(expr);

      expect(ast).toEqual(expected.ast);
    }
  );

  /* Generate custom snapshot  */
  /*
  test.only("build  expectations", () => {
    console.log(
      JSON.stringify(
        expectations.map(([expr]) => {
          const { ast, error } = new Expression(expr);
          return [
            expr,
            {
              ast,
              error,
            },
          ];
        }),
        null,
        2
      )
    );
    console.log("CODE THIS to the 'expressions.expectations.ts' file");
  });
  */
});
