import { BaseExpr } from "./BaseExpr";
import { ConstExpr } from "./ConstExpr";
import { Expression } from "./Expression";
import { FuncExpr } from "./FuncExpr";
import { type IToken, lexer } from "./Lexer";
import { VarExpr } from "./VarExpr";

import type { ISyntaxError } from "./errors";

export function parser(input: string) {
  const tokenStack: IToken[] = [];
  const funcStack: FuncExpr[] = [];

  /* Parts of root expression */
  const root: BaseExpr<string>[] = [];

  /* Where to add, root, nested function arguments */
  const astStack: BaseExpr<string>[][] = [root];

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
          const start = argAst.length ? argAst[0]!.start : token.start - 1;
          const end = argAst.length ? token.start - 1 : token.start;

          const argString = input.slice(start, end + 1);
          const expression = new Expression(argString);

          expression.start = start;
          expression.end = end;
          expression.children!.push(...argAst);
          funcStack.at(-1)?.children?.push(expression);
        }
        break;
      }
      case ")": {
        tokenStack.push(token);

        // Function end, add last argument
        const funcExpr = funcStack.pop()!;
        funcExpr.end = token.end + 1;
        ast.push(funcExpr);
        break;
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
        const lastToken = tokenStack.at(-1);
        if (lastToken?.type === ")") {
          debugger;
        }
        
        tokenStack.push(token);
      }
    }
  }

  const expression = new Expression(input);
  expression.children.push(...root);

  return {
    error,
    expression,
  };
}

export class Parser {
  readonly expression: Expression;
  readonly error?: ISyntaxError | undefined;
  readonly value: string;

  constructor(value: string) {
    const result = parser(value);
    this.value = value;
    this.expression = result.error ? new Expression("") : result.expression;
    this.error = result.error;
  }

  public walk(
    /** Return true to stop walking */
    callback: (item: BaseExpr<string>) => boolean | void | undefined,
    method: "depth-first" | "breadth-first" = "depth-first",
    item: BaseExpr<string> = this.expression
  ) {
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
}
