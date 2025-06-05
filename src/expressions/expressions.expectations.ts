import type { IExprItem } from "./BaseExpr";
import type { ISyntaxError } from "./errors";

const expectationsTemp: [
  string,
  {
    expression: object | Partial<IExprItem>;
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
    "[V]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 3,
        children: [{ type: "variable", start: 0, end: 2, name: "V" }],
        value: "[V]",
      },
    },
  ],
  [
    "[1]",
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
          "(1:1) error: Invalid first character for a block name: '1', Expected: a letter [a-Z]",
        start: 1,
        end: 1,
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
    "[V1][V2]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 8,
        children: [
          { type: "variable", start: 0, end: 3, name: "V1" },
          { type: "variable", start: 4, end: 7, name: "V2" },
        ],
        value: "[V1][V2]",
      },
    },
  ],
  [
    "[Date()]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 8,
        children: [
          { type: "func", start: 0, end: 7, children: [], name: "Date" },
        ],
        value: "[Date()]",
      },
    },
  ],
  [
    "[Date()S]",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 0,
        children: [],
        value: "",
      },
      error: {
        code: "NO_CHARS_AFTER_FUNCTION",
        message: "(7:7) error: Expected ']' after a function",
        start: 7,
        end: 7,
      },
    },
  ],
  [
    "1[V1]2[V2]3",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 11,
        children: [
          { type: "constant", start: 0, end: 0, value: "1" },
          { type: "variable", start: 1, end: 4, name: "V1" },
          { type: "constant", start: 5, end: 5, value: "2" },
          { type: "variable", start: 6, end: 9, name: "V2" },
          { type: "constant", start: 10, end: 10, value: "3" },
        ],
        value: "1[V1]2[V2]3",
      },
    },
  ],
  [
    "1[Date()]2",
    {
      expression: {
        type: "expression",
        start: 0,
        end: 10,
        children: [
          { type: "constant", start: 0, end: 0, value: "1" },
          { type: "func", start: 1, end: 8, children: [], name: "Date" },
          { type: "constant", start: 9, end: 9, value: "2" },
        ],
        value: "1[Date()]2",
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
    "[Date(]",
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
        message: "(6:6) error: Expected '\"' or ')' ",
        start: 6,
        end: 6,
      },
    },
  ],
  [
    "[Date)]",
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
          '(5:5) error: Invalid character in block name: \')\', Expected: Alphanumeric, "_", "-" or "(" to start a function)',
        start: 5,
        end: 5,
      },
    },
  ],
  [
    '[Sum("1")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 10,
        children: [
          {
            type: "func",
            start: 0,
            end: 9,
            children: [
              {
                type: "expression",
                start: 6,
                end: 6,
                children: [{ type: "constant", start: 6, end: 6, value: "1" }],
                value: "1",
              },
            ],
            name: "Sum",
          },
        ],
        value: '[Sum("1")]',
      },
    },
  ],
  [
    "[Sum(a)]",
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
        message: "(5:5) error: Expected '\"' or ')' ",
        start: 5,
        end: 5,
      },
    },
  ],
  [
    "[Sum(,)]",
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
        message: "(6:6) error: Expected '\"'",
        start: 6,
        end: 6,
      },
    },
  ],
  [
    "[Sum(()]",
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
        message: "(5:5) error: Expected '\"' or ')' ",
        start: 5,
        end: 5,
      },
    },
  ],
  [
    '[Sum( "1")]',
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
        message: "(5:5) error: Expected '\"' or ')' ",
        start: 5,
        end: 5,
      },
    },
  ],
  [
    '[Sum("1" )]',
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
        message: "(8:8) error: Expected a ',' of ')' ",
        start: 8,
        end: 8,
      },
    },
  ],
  [
    '[Sum("1"a)]',
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
        message: "(8:8) error: Expected a ',' of ')' ",
        start: 8,
        end: 8,
      },
    },
  ],
  [
    '[Sum("1""2")]',
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
        message: "(8:8) error: Argument separator required: ','",
        start: 8,
        end: 8,
      },
    },
  ],
  [
    '[Sum("1","2")]',
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
                start: 6,
                end: 6,
                children: [{ type: "constant", start: 6, end: 6, value: "1" }],
                value: "1",
              },
              {
                type: "expression",
                start: 10,
                end: 10,
                children: [
                  { type: "constant", start: 10, end: 10, value: "2" },
                ],
                value: "2",
              },
            ],
            name: "Sum",
          },
        ],
        value: '[Sum("1","2")]',
      },
    },
  ],
  [
    '[Sum("1", "2")]',
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
        message: "(9:9) error: Expected '\"'",
        start: 9,
        end: 9,
      },
    },
  ],
  [
    '[Sum("1",2)]',
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
        message: "(9:9) error: Expected '\"'",
        start: 9,
        end: 9,
      },
    },
  ],
  [
    '[Sum("1",,)]',
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
        message: "(9:9) error: Expected '\"'",
        start: 9,
        end: 9,
      },
    },
  ],
  [
    '[Sum("1",)]',
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
        message: "(9:9) error: Expected '\"'",
        start: 9,
        end: 9,
      },
    },
  ],
  [
    '[Sum("1",[a])]',
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
        message: "(9:9) error: Expected '\"'",
        start: 9,
        end: 9,
      },
    },
  ],
  [
    '[Sum("1",,"3")]',
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
        message: "(9:9) error: Expected '\"'",
        start: 9,
        end: 9,
      },
    },
  ],
  [
    '[Sum("[Sum("0")]")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 19,
        children: [
          {
            type: "func",
            start: 0,
            end: 18,
            children: [
              {
                type: "expression",
                start: 6,
                end: 15,
                children: [
                  {
                    type: "func",
                    start: 6,
                    end: 15,
                    children: [
                      {
                        type: "expression",
                        start: 12,
                        end: 12,
                        children: [
                          { type: "constant", start: 12, end: 12, value: "0" },
                        ],
                        value: "0",
                      },
                    ],
                    name: "Sum",
                  },
                ],
                value: '[Sum("0")]',
              },
            ],
            name: "Sum",
          },
        ],
        value: '[Sum("[Sum("0")]")]',
      },
    },
  ],
  [
    '[Sum("1","2[V1]","[Sum("[V2]")][Sum("1","3")]")]',
    {
      expression: {
        type: "expression",
        start: 0,
        end: 48,
        children: [
          {
            type: "func",
            start: 0,
            end: 47,
            children: [
              {
                type: "expression",
                start: 6,
                end: 6,
                children: [{ type: "constant", start: 6, end: 6, value: "1" }],
                value: "1",
              },
              {
                type: "expression",
                start: 10,
                end: 14,
                children: [
                  { type: "constant", start: 10, end: 10, value: "2" },
                  { type: "variable", start: 11, end: 14, name: "V1" },
                ],
                value: "2[V1]",
              },
              {
                type: "expression",
                start: 18,
                end: 44,
                children: [
                  {
                    type: "func",
                    start: 18,
                    end: 30,
                    children: [
                      {
                        type: "expression",
                        start: 24,
                        end: 27,
                        children: [
                          { type: "variable", start: 24, end: 27, name: "V2" },
                        ],
                        value: "[V2]",
                      },
                    ],
                    name: "Sum",
                  },
                  {
                    type: "func",
                    start: 31,
                    end: 44,
                    children: [
                      {
                        type: "expression",
                        start: 37,
                        end: 37,
                        children: [
                          { type: "constant", start: 37, end: 37, value: "1" },
                        ],
                        value: "1",
                      },
                      {
                        type: "expression",
                        start: 41,
                        end: 41,
                        children: [
                          { type: "constant", start: 41, end: 41, value: "3" },
                        ],
                        value: "3",
                      },
                    ],
                    name: "Sum",
                  },
                ],
                value: '[Sum("[V2]")][Sum("1","3")]',
              },
            ],
            name: "Sum",
          },
        ],
        value: '[Sum("1","2[V1]","[Sum("[V2]")][Sum("1","3")]")]',
      },
    },
  ],
];

export const expectations = expectationsTemp;
