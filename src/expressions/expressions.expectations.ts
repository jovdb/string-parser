import { IExprItem } from "./BaseExpr";
import { ISyntaxError } from "./errors";

const expectationsTemp: [
  string,
  {
    expression: Partial<IExprItem[]>;
    error?: Partial<ISyntaxError>;
  }
][] = [
  [
    "",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
    },
  ],
  [
    "S",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 1,
        children: [{ type: "constant", start: 0, end: 0, value: "S" }],
        value: "S",
      },
    },
  ],
  [
    " S",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 2,
        children: [{ type: "constant", start: 0, end: 1, value: " S" }],
        value: " S",
      },
    },
  ],
  [
    "S ",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 2,
        children: [{ type: "constant", start: 0, end: 1, value: "S " }],
        value: "S ",
      },
    },
  ],
  [
    "[",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "UNTERMINATED_BLOCK",
        message: "(0:0) error: Unterminated block: '['",
        start: 0,
        end: 0,
      },
    },
  ],
  [
    "(",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 1,
        children: [{ type: "constant", start: 0, end: 0, value: "(" }],
        value: "(",
      },
    },
  ],
  [
    "\\[",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 2,
        children: [{ type: "constant", start: 0, end: 1, value: "[" }],
        value: "\\[",
      },
    },
  ],
  [
    "]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 1,
        children: [{ type: "constant", start: 0, end: 0, value: "]" }],
        value: "]",
      },
    },
  ],
  [
    "[S",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "UNTERMINATED_BLOCK",
        message: "(0:1) error: Unterminated block: '['",
        start: 0,
        end: 1,
      },
    },
  ],
  [
    "[]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "EMPTY_BLOCK",
        message:
          "(0:1) error: Empty block. Remove or add a variable or function name",
        start: 0,
        end: 1,
      },
    },
  ],
  [
    "S]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 2,
        children: [{ type: "constant", start: 0, end: 1, value: "S]" }],
        value: "S]",
      },
    },
  ],
  [
    "[F]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 3,
        children: [{ type: "variable", start: 0, end: 2, name: "F" }],
        value: "[F]",
      },
    },
  ],
  [
    "[\\1]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "INVALID_BLOCK_NAME_FIRST_CHAR",
        message:
          "(2:2) error: Invalid first character for a block name: '1', Expected: a letter [a-Z]",
        start: 2,
        end: 2,
      },
    },
  ],
  [
    "C:\\\\",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 4,
        children: [{ type: "constant", start: 0, end: 3, value: "C:\\" }],
        value: "C:\\\\",
      },
    },
  ],
  [
    "[F][G]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 6,
        children: [
          { type: "variable", start: 0, end: 2, name: "F" },
          { type: "variable", start: 3, end: 5, name: "G" },
        ],
        value: "[F][G]",
      },
    },
  ],
  [
    "[F()c]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 6,
        children: [
          { type: "func", start: 0, end: 4, children: [], name: "F" },
          { type: "variable", start: 4, end: 5, name: "c" },
        ],
        value: "[F()c]",
      },
    },
  ],
  [
    "1[F]2[G]3",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 9,
        children: [
          { type: "constant", start: 0, end: 0, value: "1" },
          { type: "variable", start: 1, end: 3, name: "F" },
          { type: "constant", start: 4, end: 4, value: "2" },
          { type: "variable", start: 5, end: 7, name: "G" },
          { type: "constant", start: 8, end: 8, value: "3" },
        ],
        value: "1[F]2[G]3",
      },
    },
  ],
  [
    "[F()]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 5,
        children: [{ type: "func", start: 0, end: 4, children: [], name: "F" }],
        value: "[F()]",
      },
    },
  ],
  [
    "1[F()]2",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 7,
        children: [
          { type: "constant", start: 0, end: 0, value: "1" },
          { type: "func", start: 1, end: 5, children: [], name: "F" },
          { type: "constant", start: 6, end: 6, value: "2" },
        ],
        value: "1[F()]2",
      },
    },
  ],
  [
    "[()]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "MISSING_FUNCTION_NAME",
        message: "(1:1) error: Function name is required",
        start: 1,
        end: 1,
      },
    },
  ],
  [
    "[[]]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "INVALID_BLOCK_NAME_FIRST_CHAR",
        message:
          "(1:1) error: Invalid first character for a block name: '[', Expected: a letter [a-Z]",
        start: 1,
        end: 1,
      },
    },
  ],
  [
    "[F(]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_BEFORE_FIRST_ARG",
        message: "(3:3) error: Expected '\"' or ')' ",
        start: 3,
        end: 3,
      },
    },
  ],
  [
    "[F)]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "INVALID_BLOCK_NAME_CHAR",
        message:
          '(2:2) error: Invalid character in block name: \')\', Expected: Alphanumeric, "_" or "-"',
        start: 2,
        end: 2,
      },
    },
  ],
  [
    '[F("1")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 8,
        children: [
          {
            type: "func",
            start: 0,
            end: 7,
            children: [
              {
                type: "expression",
                start: 3,
                end: 5,
                children: [{ type: "constant", start: 4, end: 4, value: "1" }],
                value: "1",
              },
            ],
            name: "F",
          },
        ],
        value: '[F("1")]',
      },
    },
  ],
  [
    "[F(a)]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_BEFORE_FIRST_ARG",
        message: "(3:3) error: Expected '\"' or ')' ",
        start: 3,
        end: 3,
      },
    },
  ],
  [
    "[F(,)]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_ARG_SEPARATOR",
        message: "(4:4) error: Expected '\"'",
        start: 4,
        end: 4,
      },
    },
  ],
  [
    "[F(()]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_BEFORE_FIRST_ARG",
        message: "(3:3) error: Expected '\"' or ')' ",
        start: 3,
        end: 3,
      },
    },
  ],
  [
    '[F( "1")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_BEFORE_FIRST_ARG",
        message: "(3:3) error: Expected '\"' or ')' ",
        start: 3,
        end: 3,
      },
    },
  ],
  [
    '[F("1" )]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_ARG",
        message: "(6:6) error: Expected a ',' of ')' ",
        start: 6,
        end: 6,
      },
    },
  ],
  [
    '[F("1"a)]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_ARG",
        message: "(6:6) error: Expected a ',' of ')' ",
        start: 6,
        end: 6,
      },
    },
  ],
  [
    '[F("1""2")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "ARGUMENT_SEPARATOR_REQUIRED",
        message: "(6:6) error: Argument separator required: ','",
        start: 6,
        end: 6,
      },
    },
  ],
  [
    '[F("1","2")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 12,
        children: [
          {
            type: "func",
            start: 0,
            end: 11,
            children: [
              {
                type: "expression",
                start: 3,
                end: 5,
                children: [{ type: "constant", start: 4, end: 4, value: "1" }],
                value: "1",
              },
              {
                type: "expression",
                start: 7,
                end: 9,
                children: [{ type: "constant", start: 8, end: 8, value: "2" }],
                value: "2",
              },
            ],
            name: "F",
          },
        ],
        value: '[F("1","2")]',
      },
    },
  ],
  [
    '[F("1", "2")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_ARG_SEPARATOR",
        message: "(7:7) error: Expected '\"'",
        start: 7,
        end: 7,
      },
    },
  ],
  [
    '[F("1",2)]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_ARG_SEPARATOR",
        message: "(7:7) error: Expected '\"'",
        start: 7,
        end: 7,
      },
    },
  ],
  [
    '[F("1",,)]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_ARG_SEPARATOR",
        message: "(7:7) error: Expected '\"'",
        start: 7,
        end: 7,
      },
    },
  ],
  [
    '[F("1",)]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_ARG_SEPARATOR",
        message: "(7:7) error: Expected '\"'",
        start: 7,
        end: 7,
      },
    },
  ],
  [
    '[F("1",[a])]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_ARG_SEPARATOR",
        message: "(7:7) error: Expected '\"'",
        start: 7,
        end: 7,
      },
    },
  ],
  [
    '[F("1",,"3")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_ARG_SEPARATOR",
        message: "(7:7) error: Expected '\"'",
        start: 7,
        end: 7,
      },
    },
  ],
  [
    '[F1("[F2()]")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 14,
        children: [
          {
            type: "func",
            start: 0,
            end: 13,
            children: [
              {
                type: "expression",
                start: 4,
                end: 11,
                children: [
                  { type: "func", start: 5, end: 10, children: [], name: "F2" },
                ],
                value: "[F2()]",
              },
            ],
            name: "F1",
          },
        ],
        value: '[F1("[F2()]")]',
      },
    },
  ],
  [
    '[F1("1","c:\\\\[A]","[F2("[B]")][F3()]")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 39,
        children: [
          {
            type: "func",
            start: 0,
            end: 38,
            children: [
              {
                type: "expression",
                start: 4,
                end: 6,
                children: [{ type: "constant", start: 5, end: 5, value: "1" }],
                value: "1",
              },
              {
                type: "expression",
                start: 8,
                end: 16,
                children: [
                  { type: "constant", start: 9, end: 12, value: "c:\\" },
                  { type: "variable", start: 13, end: 15, name: "A" },
                ],
                value: "c:\\\\[A]",
              },
              {
                type: "expression",
                start: 18,
                end: 36,
                children: [
                  {
                    type: "func",
                    start: 19,
                    end: 29,
                    children: [
                      {
                        type: "expression",
                        start: 23,
                        end: 27,
                        children: [
                          { type: "variable", start: 24, end: 26, name: "B" },
                        ],
                        value: "[B]",
                      },
                    ],
                    name: "F2",
                  },
                  {
                    type: "func",
                    start: 30,
                    end: 35,
                    children: [],
                    name: "F3",
                  },
                ],
                value: '[F2("[B]")][F3()]',
              },
            ],
            name: "F1",
          },
        ],
        value: '[F1("1","c:\\\\[A]","[F2("[B]")][F3()]")]',
      },
    },
  ],
];

export const expectations = expectationsTemp;
