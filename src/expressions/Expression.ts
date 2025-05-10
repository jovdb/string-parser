// Split in parts

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
const placeholderStartChar = "[";
const placeholderEndChar = "]";

const functionArgsStartChar = "(";
const functionArgsEndChar = ")";

function parseExpression(expression: string): {
  items: BaseExpr<string>[];
  error?: ParseError | undefined;
} {
  const items: BaseExpr<string>[] = [];
  let error: ParseError | undefined = undefined;

  /** Move this index after processed blocks */
  let nextItemStartIndex = 0;
  let index = 0;

  const stack: (
    | {
        type: typeof placeholderStartChar;
        index: number;
      }
    | {
        type: typeof functionArgsStartChar;
        index: number;
        name: string;
      }
    | {
        type: typeof functionArgsEndChar;
        index: number;
      }
  )[] = [];

  for (index = 0; index < expression.length; index++) {
    const char = expression[index];

    switch (char) {
      // Start placeholder block: []
      case placeholderStartChar: {
        stack.push({
          type: char,
          index,
        });
        break;
      }

      // Start arguments block: ()
      case functionArgsStartChar: {
        // '(' only has meaning in a '[]' block

        const lastInStack = stack.at(-1);
        if (lastInStack?.type === placeholderStartChar) {
          const name = expression.substring(lastInStack.index + 1, index);
          stack.push({
            type: char,
            index,
            name,
          });
        }
        break;
      }

      case functionArgsEndChar: {
        const lastInStack = stack.at(-1);
        if (lastInStack?.type === functionArgsStartChar) {
          stack.push({
            type: char,
            index,
          });
        }
        break;
      }

      case placeholderEndChar: {
        const lastInStack = stack.at(-1);
        if (lastInStack) {
          // Variable?
          if (lastInStack?.type === placeholderStartChar) {
            const placeholderStart = lastInStack.index;
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
            stack.pop();
          }

          // Function
          else if (lastInStack?.type === functionArgsEndChar) {
            const prevInStack = stack.at(-2);
            if (prevInStack?.type === functionArgsStartChar) {
              const functionName = prevInStack.name;

              const thirdInStack = stack.at(-3);
              if (thirdInStack?.type === placeholderStartChar) {
                const placeholderStart = thirdInStack.index;

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
                stack.pop(); // )
              }
              stack.pop(); // (
            }
            stack.pop(); // ]
          }
        }
        break;
      }
    }
  }

  // Rest
  if (index > nextItemStartIndex) {
    const value = expression.substring(nextItemStartIndex, index);
    console.log("rest", index, nextItemStartIndex, value);
    items.push(new ConstExpr(value, nextItemStartIndex, index - 1));
  }

  if (!error) {
    const lastInStack = stack.at(-1);
    if (lastInStack) {
      // TODO: ( in stack
      /*
      error = {
        message: `Unclosed block: '${lastInStack.type}'`,
        start: lastInStack.index,
        end: index - 1,
      };
      */
    }
  }

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
