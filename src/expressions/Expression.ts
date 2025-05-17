import { BaseExpr, IExprItem } from "./BaseExpr";
import { ConstExpr } from "./ConstExpr";
import { FuncExpr } from "./FuncExpr";
import { IToken, lexer } from "./Lexer";
import { VarExpr } from "./VarExpr";
import { ISyntaxError, createError } from "./errors";

export function parser(input: string) {
  const tokenStack: IToken[] = [];
  const funcStack: FuncExpr[] = [];

  const root: BaseExpr<string>[] = [];

  /* Where to add, root, nested function arguments */
  let astStack: BaseExpr<string>[][] = [root];

  let error: ISyntaxError | undefined;

  const tokens = [
    ...lexer(input, (err) => {
      if (!error) {
        error = err;
      }
    }),
  ];

  for (const token of tokens) {
    if (error) break;

    /** Current ast level */
    let ast = astStack.at(-1)!;

    const lastStackItem = tokenStack.at(-1);

    // Constant
    switch (token.type) {
      case "constant": {
        ast.push(new ConstExpr(token.start, token.end, token.value!));
        break;
      }
      case "(": {
        // Get function name
        const functionName = lastStackItem!.value!;
        const start = tokenStack.at(-2)?.start!;
        const end = token.end;
        const funcExpr = new FuncExpr(start, end, functionName);

        tokenStack.push(token);
        funcStack.push(funcExpr);
        break;
      }

      case '"': {
        if (token.requiresClosing) {
          // Start argument
          // Create a new ast level for the function arguments
          ast = [];
          astStack.push(ast);
        } else {
          // End argument
          // End function, clear args stack
          const argAst = astStack.pop()!;
          ast = astStack.at(-1)!;

          // Add argument to function
          funcStack.at(-1)?.children?.push(argAst);
        }
        break;
      }
      case ")": {
        tokenStack.push(token);

        // Function end, add last argument
        const funcExpr = funcStack.pop()!;
        funcExpr.end = token.end + 1;
        ast.push(funcExpr);
      }

      case "]": {
        const startTokenIndex = tokenStack.findLastIndex(
          (token) => token.type === "["
        );

        if (lastStackItem?.type === "name") {
          const varName = lastStackItem.value!;
          const start = tokenStack.at(startTokenIndex)!.start;
          const end = token.end;
          const varExpr = new VarExpr(start, end, varName);
          ast.push(varExpr);
        }

        tokenStack.splice(startTokenIndex, tokenStack.length - startTokenIndex);
        break;
      }
      default: {
        tokenStack.push(token);
      }
    }
  }

  return {
    error,
    ast: root,
  };
}

export class Expression extends BaseExpr<"expression"> {
  readonly ast: BaseExpr<string>[];
  readonly error?: ISyntaxError | undefined;
  readonly value: string;

  constructor(value: string) {
    super("expression", 0, value.length);

    const result = parser(value);
    this.value = value;
    this.ast = result.error ? [] : result.ast;
    this.error = result.error;
  }

  public walk(
    /** Return true to stop walking */
    callback: (item: BaseExpr<string>) => boolean | void | undefined,
    method: "depth-first" | "breadth-first" = "depth-first",
    expression = this.ast
  ) {
    expression.some((item) => {
      if (method === "breadth-first") {
        if (callback(item)) return true;
      }
      if (item.children) {
        if (
          item.children.some((child) => {
            return this.walk(callback, method, child);
          })
        )
          return true;
      }
      if (method === "depth-first") {
        if (callback(item)) return true;
      }
    });
  }

  public getAtIndex(charIndex: number) {
    const items: BaseExpr<string>[] = [];

    this.walk((item) => {
      if (charIndex >= item.start && charIndex <= item.end) {
        items.push(item);
      }
    });

    return items;
  }

  /** Generate a error message that can be displayed below the expression */
  public toEditorError() {
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
    return this.ast.map((item) => item.evaluate()).join("");
  }
}
