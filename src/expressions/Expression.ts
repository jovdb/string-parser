// Split in parts

import { ParsedStack } from "vitest";
import { BaseExpr, IExprItem } from "./BaseExpr";
import { ConstExpr } from "./ConstExpr";
import { FuncExpr } from "./FuncExpr";
import { VarExpr } from "./VarExpr";

export type ExpressionType = IExprItem[];

export interface ParseError {
  message: string;
  start: number;
  end: number;
}

function validateName(name: string, offsetIndex: number, type: string) {
  const regExp = new RegExp("[a-zA-Z0-9_-]");
  for (let index = 0; index < name.length; index++) {
    const char = name[index]!;
    if (index === 0) {
      if (!new RegExp("[a-zA-Z_]").test(char)) {
        return {
          message: `Invalid first character of ${type} name '${char}', allowed: '[a-zA-Z_]'`,
          start: offsetIndex,
          end: offsetIndex,
        };
      }
    } else {
      if (!regExp.test(char)) {
        return {
          message: `Invalid character in ${type} name '${char}', allowed: '[a-zA-Z0-9_-]'`,
          start: offsetIndex + index,
          end: offsetIndex + index,
        };
      }
    }
  }
}
const PLACEHOLDER_START_CHAR = "[";
const PLACEHOLDER_END_CHAR = "]";

const FUNCTION_ARGS_START_CHAR = "(";
const FUNCTION_ARGS_END_CHAR = ")";

type TokenStackItem =
  | {
      type: typeof PLACEHOLDER_START_CHAR;
      index: number;
    }
  | {
      type: typeof FUNCTION_ARGS_START_CHAR;
      index: number;
      name: string;
    }
  | {
      type: typeof FUNCTION_ARGS_END_CHAR;
      index: number;
    };

function createTokenStack(debug?: (s: string) => void) {
  const stack: TokenStackItem[] = [];

  return {
    stack,
    push(item: (typeof stack)[number]) {
      stack.push(item);
      debug?.(`TokenStack: pushed item: ${JSON.stringify(item)}`);
    },
    pop() {
      const item = stack.pop();
      debug?.(`TokenStack: popped item: ${JSON.stringify(item)}`);
      return item;
    },
    isLastToken(type: TokenStackItem["type"], pos = -1) {
      const item = stack.at(pos);
      return item?.type === type ? item : undefined;
    },
    areLastTokens(types: TokenStackItem["type"][]) {
      const items = stack.slice(-types.length);
      const areSame = items.every((item, index) => item.type === types[index]);
      if (areSame) {
        return items;
      }
      return undefined;
    },
  };
}

function parseExpression(expression: string): {
  items: BaseExpr<string>[];
  error?: ParseError | undefined;
} {
  const items: BaseExpr<string>[] = [];
  let error: ParseError | undefined = undefined;

  /** Move this index after processed blocks */
  let nextItemStartIndex = 0;
  let index = 0;

  const debug = (s: string) => {
    console.log(s);
  };

  // Possible token combinations tokens:
  // []  : variable
  // [)] : constant (no function args started)
  // [(] : constant (unclosed function args)
  // [()]: function
  // [)(]: constant

  const tokenStack = createTokenStack(debug);

  for (index; index < expression.length; index++) {
    const char = expression[index];

    switch (char) {
      // Start placeholder block: []
      case PLACEHOLDER_START_CHAR: {
        // Current only supports one level of nesting
        if (tokenStack.stack.length === 0) {
          tokenStack.push({
            type: char,
            index,
          });
        }
        break;
      }

      // Start arguments block: ()
      case FUNCTION_ARGS_START_CHAR: {
        // '(' only has meaning in a '[]' block
        const lastPlaceholderStart = tokenStack.isLastToken(
          PLACEHOLDER_START_CHAR
        );
        if (lastPlaceholderStart) {
          const name = expression.substring(
            lastPlaceholderStart.index + 1,
            index
          );
          tokenStack.push({
            type: char,
            index,
            name,
          });
        }
        break;
      }

      case FUNCTION_ARGS_END_CHAR: {
        const lastFunctionArgsStart = tokenStack.isLastToken(
          FUNCTION_ARGS_START_CHAR
        );
        if (lastFunctionArgsStart) {
          tokenStack.push({
            type: char,
            index,
          });
        }
        break;
      }

      case PLACEHOLDER_END_CHAR:
        {
          const lastPlaceholderStart = tokenStack.isLastToken(
            PLACEHOLDER_START_CHAR
          );
          if (lastPlaceholderStart) {
            const placeholderStart = lastPlaceholderStart.index;
            const value = expression.substring(placeholderStart, index + 1);
            if (value.length > 2) {
              // Before [ = Constant prefix
              if (placeholderStart > nextItemStartIndex) {
                const value = expression.substring(
                  nextItemStartIndex,
                  placeholderStart
                );
                items.push(
                  new ConstExpr(value, nextItemStartIndex, placeholderStart - 1)
                );
              }

              // Variable part
              if (index > placeholderStart) {
                const name = expression.substring(placeholderStart + 1, index);

                error ??= validateName(name, placeholderStart + 1, "function");

                const varExpr = new VarExpr(
                  value,
                  placeholderStart,
                  index,
                  name
                );
                items.push(varExpr);
              }

              nextItemStartIndex = index + 1;
            } else {
              // Allow empty placeholder
              // nextItemStartIndex = index + 1;
              //stack.pop();
            }
            tokenStack.pop();
          }

          // Function
          const lastFunctionArgsEnd = tokenStack.isLastToken(
            FUNCTION_ARGS_END_CHAR
          );
          if (lastFunctionArgsEnd) {
            const lastFunctionArgsStart = tokenStack.isLastToken(
              FUNCTION_ARGS_START_CHAR,
              -2
            );
            if (lastFunctionArgsStart) {
              const lastPlaceholderStart = tokenStack.isLastToken(
                PLACEHOLDER_START_CHAR,
                -3
              );
              if (lastPlaceholderStart) {
                const placeholderStart = lastPlaceholderStart.index;
                const functionName = expression.substring(
                  placeholderStart + 1,
                  lastFunctionArgsStart.index
                );

                error ??= validateName(
                  functionName,
                  placeholderStart + 1,
                  "function"
                );

                if (!error) {
                  // Before [ = Constant prefix
                  if (placeholderStart > nextItemStartIndex) {
                    const value = expression.substring(
                      nextItemStartIndex,
                      placeholderStart
                    );
                    items.push(
                      new ConstExpr(
                        value,
                        nextItemStartIndex,
                        placeholderStart - 1
                      )
                    );
                  }

                  const funcExpr = new FuncExpr(
                    expression.substring(placeholderStart, index + 1),
                    placeholderStart,
                    index,
                    functionName
                  );
                  items.push(funcExpr);
                  nextItemStartIndex = index + 1;
                }
                tokenStack.pop(); // )
              }
              tokenStack.pop(); // (
            }
            tokenStack.pop(); // ]
          }
        }
        break;
    }
  }

  // Rest
  console.log(expression, "rest", index, nextItemStartIndex);
  if (index > nextItemStartIndex) {
    const value = expression.substring(nextItemStartIndex, index);
    console.log("rest2", index, nextItemStartIndex, value);
    items.push(new ConstExpr(value, nextItemStartIndex, index - 1));
  }

  /*
  if (!error) {
    const lastInStack = stack.at(-1);
    if (lastInStack) {
      // TODO: ( in stack
      error = {
        message: `Unclosed block: '${lastInStack.type}'`,
        start: lastInStack.index,
        end: index - 1,
      };
      
    }
  }
  */

  return {
    items,
    error,
  };
}

export class Expression extends BaseExpr<"expression"> {
  readonly items: BaseExpr<string>[];
  readonly error?: ParseError | undefined;

  constructor(value: string) {
    super("expression", value, 0, value.length);

    const result = parseExpression(value);
    this.items = result.items;
    this.error = result.error;
  }

  public getAtIndex(charIndex: number) {
    const items: IExprItem[] = [];
    this.items.some((expr) => {
      if (charIndex >= expr.start && charIndex <= expr.end) {
        items.push(expr);
        // TODO: Children
        // ...item.push(expr.children)
        return true;
      }
      return false;
    });
    return items;
  }

  public toConsoleError() {
    const { error } = this;
    if (!error) return "";

    return [
      `${"".padStart(error.start, " ")}${"".padStart(
        error.end - error.start + 1,
        "~"
      )}`,

      `${"".padStart(error.start, " ")}╰─→ ${error.message}`,
    ].join("\n");
  }

  public evaluate() {
    return this.items.map((item) => item.evaluate()).join("");
  }
}
