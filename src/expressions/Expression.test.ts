import { describe, expect, test } from "vitest";
import { IExprItem } from "./BaseExpr";
import { ParseError, Expression } from "./expression";

describe("expression", () => {
  const tests = [
    [
      "",
      {
        items: [],
      },
    ],
    [
      "S",
      {
        items: [
          {
            type: "constant",
            value: "S",
            start: 0,
            end: 0,
          },
        ],
      },
    ],
    [
      " S",
      {
        items: [
          {
            type: "constant",
            value: " S",
            start: 0,
            end: 1,
          },
        ],
      },
    ],
    [
      " S ",
      {
        items: [
          {
            type: "constant",
            value: " S ",
            start: 0,
            end: 2,
          },
        ],
      },
    ],
    [
      "[",
      {
        items: [{ type: "constant", value: "[", start: 0, end: 0 }],
        /*
        error: {
          message: "Unclosed block: '['",
          start: 0,
          end: 0,
        },
        */
      },
    ],
    ["]", { items: [{ type: "constant", value: "]", start: 0, end: 0 }] }],
    [
      "[S",
      {
        items: [{ type: "constant", value: "[S", start: 0, end: 1 }],
        /*
        error: {
          message: "Unclosed block: '['",
          start: 0,
          end: 1,
        },
        */
      },
    ],
    [
      "[]",
      {
        items: [
          {
            type: "constant",
            value: "[]",
            start: 0,
            end: 1,
          },
        ],
        /*
        error: {
          message: 'Function name expected',
          start: 0,
          end: 1,
        },*/
      },
    ],
    [
      "S]",
      {
        items: [
          {
            type: "constant",
            value: "S]",
            start: 0,
            end: 1,
          },
        ],
        /*
        error: {
          message: 'Function name expected',
          start: 0,
          end: 1,
        },*/
      },
    ],
    [
      "[F]",
      {
        items: [
          {
            type: "variable",
            value: "[F]",
            start: 0,
            end: 2,
            name: "F",
          },
        ],
        /*
        error: {
          message: 'Function name expected',
          start: 0,
          end: 2,
        },*/
      },
    ],
    [
      "[F][G]",
      {
        items: [
          {
            type: "variable",
            value: "[F]",
            start: 0,
            end: 2,
            name: "F",
          },
          {
            type: "variable",
            value: "[G]",
            start: 3,
            end: 5,
            name: "G",
          },
        ],
      },
    ],
    [
      "1[F]2[G]3",
      {
        items: [
          {
            type: "constant",
            value: "1",
            start: 0,
            end: 0,
          },
          {
            type: "variable",
            value: "[F]",
            start: 1,
            end: 3,
            name: "F",
          },
          {
            type: "constant",
            value: "2",
            start: 4,
            end: 4,
          },
          {
            type: "variable",
            value: "[G]",
            start: 5,
            end: 7,
            name: "G",
          },
          {
            type: "constant",
            value: "3",
            start: 8,
            end: 8,
          },
        ],
      },
    ],
    [
      "S[F()]",
      {
        items: [
          {
            type: "constant",
            value: "S",
            start: 0,
            end: 0,
          },
          {
            type: "func",
            value: "[F()]",
            start: 1,
            end: 5,
            name: "F",
          },
        ],
      },
    ],

    [
      "[F(]",
      {
        items: [
          {
            type: "constant",
            value: "[F(]",
            start: 0,
            end: 3,
          },
        ],
      },
    ],

    [
      "[F)]",
      {
        items: [
          {
            type: "constant",
            value: "[F)]",
            start: 0,
            end: 3,
          },
        ],
      },
    ],
    /*
    [
      '[F()]',
      {
        items: [
          {
            type: 'func',
            value: '[F()]',
            start: 0,
            end: 4,
            name: 'F',
          },
        ],
      },
    ],*/
  ] as [
    expression: string,
    expected: {
      items: IExprItem[];
      error?: ParseError;
    }
  ][];

  test.for(tests.slice(0))("parse '%s'", ([expr, expected]) => {
    const expression = new Expression(expr);

    const actual = {
      items: expression.items,
      error: expression.error,
    };

    expect(actual).toEqual(expected);
  });

  /*
  console.log('----------');
  const logLen = Object.keys(tests).reduce(
    (max, cur) => Math.max(max, cur.length),
    0
  );
  Object.entries(tests).every(([expr, expected]) => {
    const expression = new Expression(expr);

    const actual = {
      items: expression.items,
      error: expression.error,
    };

    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      // console.log(`${`'${expr}'`.padEnd(logLen + 2, ' ')}: OK`);
      return true;
    } else {
      console.log(`${`'${expr}'`.padEnd(logLen + 2, ' ')}: NOK`);
      console.log(expression.toConsoleError());
      console.warn(JSON.stringify({ expected, actual }, null, 2));
      return false;
    }
  });*/
});
