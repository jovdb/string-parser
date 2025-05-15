import { BaseExpr, IExprItem } from "./BaseExpr";
import { ConstExpr } from "./ConstExpr";
import { FuncExpr } from "./FuncExpr";
import { IToken, lexer } from "./Lexer";
import { VarExpr } from "./VarExpr";

type ErrorCodes =
  | "UNSUPPORTED"
  | "INVALID_BLOCK"
  | "UNTERMINATED_BLOCK"
  | "INVALID_BLOCK_NAME_CHAR"
  | "NO_CHARS_AFTER_FUNCTION"
  | "NO_CHARS_BETWEEN_ARGUMENTS"
  | "ARGUMENT_SEPARATOR_REQUIRED";

export interface ISyntaxError {
  code: ErrorCodes;
  message: string;
  start: number;
  end: number;
}

export function createError({
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
    case "INVALID_BLOCK_NAME_CHAR": {
      errorMessage = `Invalid character in block name: '${value}', allowed: [a-zA-Z0-9-_]`;
      break;
    }
    case "NO_CHARS_AFTER_FUNCTION": {
      errorMessage = `Expected ']' after a function`;
      break;
    }
    case "NO_CHARS_BETWEEN_ARGUMENTS": {
      errorMessage = `No extra characters allowed between function arguments. Wrap function arguments between '"'"`;
      break;
    }
    case "ARGUMENT_SEPARATOR_REQUIRED": {
      errorMessage = `Argument separator required: ','`;
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

  function getLastBlockInfo() {
    const blockStartIndex = tokenStack.findLastIndex(
      (token) => token.type === "["
    );
    const blockTokens =
      blockStartIndex >= 0 ? tokenStack.slice(blockStartIndex) : [];
    return {
      blockTokens,
      blockString: blockTokens.map((token) => token.type).join(""),
    };
  }

  for (const token of tokens) {
    if (error) break;

    /** Current ast level */
    let ast = astStack.at(-1)!;

    // Constant
    if (token.type === "constant") {
      const value = input.slice(token.start, token.end + 1);
      ast.push(new ConstExpr(token.start, token.end, value));
    } else if (token.type === "(") {
      tokenStack.push(token);
      const { blockString, blockTokens } = getLastBlockInfo();
      if (blockString === "[name(") {
        const name = input.slice(
          blockTokens[1]!.start,
          blockTokens[1]!.end + 1
        );

        /** Store function, so we can add arguments to it */
        const funcExpr = new FuncExpr(blockTokens[0]!.start, token.end, name);
        // Create a new ast level for the function arguments
        ast = [];
        astStack.push(ast);

        funcStack.push(funcExpr);
      }
    } else if (token.type === ")") {
      tokenStack.push(token);
      // Function end, add last argument
      const funcExpr = funcStack.at(-1)!;
      if (funcExpr && ast.length) {
        funcExpr.children.push(ast);
      }
      astStack.pop();
      ast = astStack.at(-1)!;
    } else if (token.type === "]") {
      // Validate the parts
      tokenStack.push(token);
      const { blockString, blockTokens } = getLastBlockInfo();
      if (blockString === "[name]") {
        // Variable
        const name = input.slice(
          blockTokens[1]!.start,
          blockTokens[1]!.end + 1
        );
        const varExpr = new VarExpr(blockTokens[0]!.start, token.end, name);

        ast.push(varExpr);
      } else if (blockString === "[name()]") {
        // Function
        const funcExpr = funcStack.pop();
        if (funcExpr) {
          funcExpr.end = token.end;
          ast.push(funcExpr);
        }
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
        workingTree.push(new ConstExpr(start, end, value));
        */
      }
      tokenStack.splice(-blockTokens.length, blockTokens.length);
    } else {
      tokenStack.push(token);
    }
  }

  /* Already done by lexer
  // Check for unterminated blocks
  const lastBlockToken = tokenStack.findLast(
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
  */

  // Stack expected to be empty
  if (tokenStack.length > 0) {
    error ??= {
      message: `Parser error: Unexpected stack content: '${tokenStack
        .map((t) => t.type)
        .join(",")}'`,
      start: tokenStack.at(0)!.start,
      end: tokenStack.at(-1)!.end,
    };
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
