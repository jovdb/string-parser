import { b } from "vitest/dist/chunks/suite.d.FvehnV49.js";
import { BaseExpr, IExprItem } from "./BaseExpr";
import { ConstExpr } from "./ConstExpr";
import { FuncExpr } from "./FuncExpr";
import { IToken, lexer } from "./Lexer";
import { VarExpr } from "./VarExpr";

export interface ISyntaxError {
  message: string;
  start: number;
  end: number;
}
type ErrorCodes = "UNSUPPORTED" | "INVALID_BLOCK" | "UNTERMINATED_BLOCK";

function createError({
  code,
  start,
  end,
  value,
}: {
  code: ErrorCodes;
  start: number;
  end: number;
  value?: string;
}) {
  let errorMessage = "";
  switch (code) {
    case "UNTERMINATED_BLOCK": {
      errorMessage = `Unterminated block: '${value}'`;
      break;
    }
    case "INVALID_BLOCK": {
      errorMessage = `Invalid variable of function definition`;
      break;
    }
    case "UNSUPPORTED": {
      errorMessage = `Unsupported: '${value}'`;
      break;
    }
    default: {
      errorMessage = `Unknown error code: '${code}'`;
      break;
    }
  }
  const formattedMessage = `(${start}:${end}) error: ${errorMessage}`;
  return {
    code,
    message: formattedMessage,
    start,
    end,
  };
}

export function parser(input: string) {
  const stack: IToken[] = [];
  const ast: BaseExpr<string>[] = [];
  let error: ISyntaxError | undefined;

  const tokens = [...lexer(input)];
  console.log("Tokens:", tokens);

  for (const token of tokens) {
    if (error) break;

    // Constant
    if (token.type === "constant") {
      const value = input.slice(token.start, token.end + 1);
      ast.push(new ConstExpr(token.start, token.end, value));
    } else if (token.type === "]") {
      // Validate the parts
      const blockStartIndex = stack.findLastIndex(
        (token) => token.type === "["
      );
      const blockTokens = stack.slice(blockStartIndex);
      const format =
        blockTokens.map((token) => token.type).join("") + token.type;

      if (format === "[name]") {
        // Variable
        const name = input.slice(
          blockTokens[1]!.start,
          blockTokens[1]!.end + 1
        );
        ast.push(new VarExpr(blockTokens[0]!.start, token.end, name));
      } else if (format === "[name()]") {
        // Function
        const name = input.slice(
          blockTokens[1]!.start,
          blockTokens[1]!.end + 1
        );
        ast.push(new FuncExpr(blockTokens[0]!.start, token.end, name));
      } else {
        // Invalid block
        error ??= createError({
          code: "INVALID_BLOCK",
          start: blockTokens[0]!.start + 1,
          end: token.end - 1,
        });
        // Add as constant to the AST
        /*const start = blockTokens[0]!.start;
        const end = token.end;
        const value = input.slice(start, end + 1);
        ast.push(new ConstExpr(start, end, value));
        */
      }
      stack.splice(-blockTokens.length, blockTokens.length);
    } else {
      stack.push(token);
    }
  }

  // Check for unterminated blocks
  const lastBlockToken = stack.findLast(
    (token) => token.type === "[" || token.type === "("
  )!;
  if (lastBlockToken) {
    error ??= createError({
      code: "UNTERMINATED_BLOCK",
      start: lastBlockToken.start,
      end: lastBlockToken.end,
      value: lastBlockToken.type,
    });
  }

  // Stack expected to be empty
  if (stack.length > 0) {
    error ??= {
      message: `Parser error: Unexpected stack content: '${stack
        .map((t) => t.type)
        .join(",")}'`,
      start: stack.at(0)!.start,
      end: stack.at(-1)!.end,
    };
  }

  return {
    error,
    ast,
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

  public getAtIndex(charIndex: number) {
    const items: BaseExpr<string>[] = [];
    this.ast.some((expr) => {
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
    return this.ast.map((item) => item.evaluate()).join("");
  }
}
