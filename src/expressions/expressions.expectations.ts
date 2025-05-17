import { IExprItem } from "./BaseExpr";
import { ISyntaxError } from "./Expression";

export const expectations: [
  string,
  {
    ast: Partial<IExprItem[]>;
    error?: Partial<ISyntaxError>;
  }
][] = [
  [
    "",
    {
      ast: [],
    },
  ],
  [
    "S",
    {
      ast: [
        {
          type: "constant",
          start: 0,
          end: 0,
          value: "S",
        },
      ],
    },
  ],
  [
    " S",
    {
      ast: [
        {
          type: "constant",
          start: 0,
          end: 1,
          value: " S",
        },
      ],
    },
  ],
  [
    "S ",
    {
      ast: [
        {
          type: "constant",
          start: 0,
          end: 1,
          value: "S ",
        },
      ],
    },
  ],
  [
    "[",
    {
      ast: [],
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
      ast: [
        {
          type: "constant",
          start: 0,
          end: 0,
          value: "(",
        },
      ],
    },
  ],
  [
    "\\[",
    {
      ast: [
        {
          type: "constant",
          start: 0,
          end: 1,
          value: "[",
        },
      ],
    },
  ],
  [
    "]",
    {
      ast: [
        {
          type: "constant",
          start: 0,
          end: 0,
          value: "]",
        },
      ],
    },
  ],
  [
    "[S",
    {
      ast: [],
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
      ast: [],
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
      ast: [
        {
          type: "constant",
          start: 0,
          end: 1,
          value: "S]",
        },
      ],
    },
  ],
  [
    "[F]",
    {
      ast: [
        {
          type: "variable",
          start: 0,
          end: 2,
          name: "F",
        },
      ],
    },
  ],
  [
    "[\\1]",
    {
      ast: [],
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
      ast: [
        {
          type: "constant",
          start: 0,
          end: 3,
          value: "C:\\",
        },
      ],
    },
  ],
  [
    "[F][G]",
    {
      ast: [
        {
          type: "variable",
          start: 0,
          end: 2,
          name: "F",
        },
        {
          type: "variable",
          start: 3,
          end: 5,
          name: "G",
        },
      ],
    },
  ],
  [
    "[F()c]",
    {
      ast: [
        {
          type: "func",
          start: 0,
          end: 4,
          children: [],
          name: "F",
        },
        {
          type: "variable",
          start: 4,
          end: 5,
          name: "c",
        },
      ],
    },
  ],
  [
    "1[F]2[G]3",
    {
      ast: [
        {
          type: "constant",
          start: 0,
          end: 0,
          value: "1",
        },
        {
          type: "variable",
          start: 1,
          end: 3,
          name: "F",
        },
        {
          type: "constant",
          start: 4,
          end: 4,
          value: "2",
        },
        {
          type: "variable",
          start: 5,
          end: 7,
          name: "G",
        },
        {
          type: "constant",
          start: 8,
          end: 8,
          value: "3",
        },
      ],
    },
  ],
  [
    "[F()]",
    {
      ast: [
        {
          type: "func",
          start: 0,
          end: 4,
          children: [],
          name: "F",
        },
      ],
    },
  ],
  [
    "1[F()]2",
    {
      ast: [
        {
          type: "constant",
          start: 0,
          end: 0,
          value: "1",
        },
        {
          type: "func",
          start: 1,
          end: 5,
          children: [],
          name: "F",
        },
        {
          type: "constant",
          start: 6,
          end: 6,
          value: "2",
        },
      ],
    },
  ],
  [
    "[()]",
    {
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [],
      error: {
        code: "INVALID_BLOCK_NAME_CHAR",
        message:
          "(2:2) error: Invalid first character for a block name: ')', Expected: a letter [a-Z]",
        start: 2,
        end: 2,
      },
    },
  ],

  [
    '[F("1")]',
    {
      ast: [
        {
          type: "func",
          start: 0,
          end: 7,
          children: [
            [
              {
                type: "constant",
                start: 4,
                end: 4,
                value: "1",
              },
            ],
          ],
          name: "F",
        },
      ],
    },
  ],
  [
    "[F(a)]",
    {
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [
        {
          type: "func",
          start: 0,
          end: 11,
          children: [
            [
              {
                type: "constant",
                start: 4,
                end: 4,
                value: "1",
              },
            ],
            [
              {
                type: "constant",
                start: 8,
                end: 8,
                value: "2",
              },
            ],
          ],
          name: "F",
        },
      ],
    },
  ],
  [
    '[F("1", "2")]',
    {
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [],
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
      ast: [
        {
          type: "func",
          start: 0,
          end: 13,
          children: [
            [
              {
                type: "func",
                start: 5,
                end: 10,
                children: [],
                name: "F2",
              },
            ],
          ],
          name: "F1",
        },
      ],
    },
  ],
  [
    '[F1("1","c:\\\\[A]","[F2("[B]")][F3()]")]',
    {
      ast: [
        {
          type: "func",
          start: 0,
          end: 38,
          children: [
            [
              {
                type: "constant",
                start: 5,
                end: 5,
                value: "1",
              },
            ],
            [
              {
                type: "constant",
                start: 9,
                end: 12,
                value: "c:\\",
              },
              {
                type: "variable",
                start: 13,
                end: 15,
                name: "A",
              },
            ],
            [
              {
                type: "func",
                start: 19,
                end: 29,
                children: [
                  [
                    {
                      type: "variable",
                      start: 24,
                      end: 26,
                      name: "B",
                    },
                  ],
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
          ],
          name: "F1",
        },
      ],
    },
  ],
];
