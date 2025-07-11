// Split in parts

import { createError, type ISyntaxError } from "./errors";

// Because tokens have no double meaning yet, I used the character as token name
export type TokenType =
  | "constant" // constant value
  | "name" // function or variable name
  | "(" // Starts a function
  | ")" // Ends a function
  | "[" // Starts a variable or function
  | "]" // Ends a variable or function
  | '"' // Start or end of a function argument
  | ","; // Function argument separator

export interface IToken<TType extends TokenType = TokenType> {
  type: TType;
  /** 0-based index of the first character position in the input string */
  start: number;
  /** 0-based index of the last character position in the input string */
  end: number;
  /** example: '[', '(' or '"'] */
  requiresClosing?: boolean;
  /** Unescaped value */
  value?: string | undefined;
}

export class Token<TType extends TokenType> implements IToken<TType> {
  type: TType;
  start: number;
  end: number;
  requiresClosing: boolean;
  value: string | undefined;

  constructor(
    type: TType,
    start: number,
    {
      end = start,
      requiresClosing = false,
      value = type,
    }: {
      end?: number;
      requiresClosing?: boolean;
      value?: string;
    } = {}
  ) {
    this.type = type;
    this.start = start;
    this.end = end;
    this.requiresClosing = requiresClosing;
    this.value = value;
  }
}

export function* lexer(
  input: string,
  onError: ((error: ISyntaxError) => void) | undefined
) {
  let buffer = "";
  let escapeNext = false;
  const tokenStack: IToken[] = [];
  let index = -1;
  let lastTokenEndIndex = -1;
  let argCount = 0;
  /** Set to true after ) and before ] */
  let afterFunction = false;

  function validateBlockNameChar(
    lastStackItem: IToken | undefined,
    char: string
  ) {
    if (lastStackItem?.type === "[") {
      // If we are building a block name
      const regEx = buffer.length === 1 ? "^[a-zA-Z]" : "^[a-zA-Z0-9-_*]$";
      const code =
        buffer.length === 1
          ? "INVALID_BLOCK_NAME_FIRST_CHAR"
          : "INVALID_BLOCK_NAME_CHAR";
      if (!RegExp(regEx).test(char)) {
        onError?.(
          createError({
            code,
            start: index,
            end: index,
            value: char,
          })
        );
        return false;
      }
    }
    return true;
  }

  function getTextType() {
    if (tokenStack.length === 0) {
      return "constant";
    }
    const lastToken = tokenStack.at(-1);
    if (lastToken?.type === "[") {
      return "name";
    } else if (lastToken?.type === "(") {
      return "constant";
    }
    return "constant";
  }

  /** Get the string/buffer before the current token */
  function getBeforeToken() {
    if (buffer.length > 0) {
      const token = new Token(getTextType(), lastTokenEndIndex + 1, {
        end: index - 1,
        value: buffer,
      });
      buffer = "";
      return token;
    }
    return undefined;
  }

  for (const char of input) {
    index++;
    const lastStackItem = tokenStack.at(-1);

    if (escapeNext) {
      // Add to buffer, don't interpret as special char
      buffer += char;

      validateBlockNameChar(lastStackItem, char);
      escapeNext = false;
      continue;
    } else if (char === "\\") {
      escapeNext = true;
      continue;
    } else if (char === "[") {
      if (
        // new block
        tokenStack.length === 0 ||
        // function argument
        (lastStackItem?.type === '"' && lastStackItem.requiresClosing)
      ) {
        // Before [
        const beforeToken = getBeforeToken();
        if (beforeToken) {
          yield beforeToken;
        }

        // Variable or function start
        const token = new Token(char, index, {
          requiresClosing: true,
        });
        tokenStack.push(token);
        lastTokenEndIndex = index;
        yield token;
        continue;
      }
    } else if (char === "(") {
      if (lastStackItem?.type === "[") {
        // Before (
        const beforeToken = getBeforeToken();
        if (!beforeToken) {
          onError?.(
            createError({
              code: "MISSING_FUNCTION_NAME",
              start: index,
              end: index,
            })
          );
        }
        if (beforeToken) {
          yield beforeToken;
        }

        // Function start
        const token = new Token(char, index, {
          requiresClosing: true,
        });
        tokenStack.push(token);
        lastTokenEndIndex = index;
        argCount = 0;
        yield token;
        continue;
      }
    } else if (char === "]") {
      if (lastStackItem?.type === "[") {
        // Detect if it the close of a variable or function
        // const isVariable = lastStackItem.end === lastTokenEndIndex;

        // Before [
        const beforeToken = getBeforeToken();
        if (beforeToken) {
          yield beforeToken;
        }

        // Variable or function end
        const token = new Token(char, index);
        tokenStack.pop(); // Remove [
        lastTokenEndIndex = index;
        yield token;

        afterFunction = false;
        // Empty
        if (lastStackItem.end === index - 1) {
          onError?.(
            createError({
              code: "EMPTY_BLOCK",
              start: lastStackItem.start,
              end: index,
            })
          );
          tokenStack.pop(); // Remove [
        }
        continue;
      }
    } else if (char === ")") {
      if (lastStackItem?.type === "(") {
        // Before [
        const beforeToken = getBeforeToken();
        if (beforeToken) {
          yield beforeToken;
        }

        // Function arguments end
        const token = new Token(char, index);
        tokenStack.pop(); // remove (
        lastTokenEndIndex = index;
        yield token;

        afterFunction = true;
        continue;
      }
    } else if (char === '"') {
      if (lastStackItem?.type === "(" || lastStackItem?.type === ",") {
        if (argCount > 0) {
          if (lastStackItem?.type !== ",") {
            onError?.(
              createError({
                code: "ARGUMENT_SEPARATOR_REQUIRED",
                start: index,
                end: index,
                value: char,
              })
            );
          }
        }

        if (lastStackItem?.type === ",") {
          tokenStack.pop(); // remove
        }

        // Argument start
        const token = new Token(char, index, {
          requiresClosing: true,
        });
        tokenStack.push(token);
        lastTokenEndIndex = index;
        yield token;

        continue;
      } else if (lastStackItem?.type === '"') {
        // Before closing "
        const beforeToken = getBeforeToken();
        if (beforeToken) {
          yield beforeToken;
        }

        // Argument end
        const token = new Token(char, index);
        tokenStack.pop();
        lastTokenEndIndex = index;
        argCount += 1;
        yield token;
        continue;
      }
    } else if (char === ",") {
      if (lastStackItem?.type === "(") {
        // Args separator
        const token = new Token(char, index);
        lastTokenEndIndex = index;
        tokenStack.push(token); // push so we can check it at next
        yield token;
        continue;
      }
    }

    // Normal character
    buffer += char;

    // Validate allowed input characters
    if (!validateBlockNameChar(lastStackItem, char)) {
      // Invalid
    } else if (lastStackItem?.type === "[") {
      if (afterFunction) {
        // After a function
        onError?.(
          createError({
            code: "NO_CHARS_AFTER_FUNCTION",
            start: index,
            end: index,
          })
        );
      } else {
        // If we are building a block name
        const regEx = buffer.length === 1 ? "^[a-zA-Z]" : "^[a-zA-Z0-9-_*]$";
        const code =
          buffer.length === 1
            ? "INVALID_BLOCK_NAME_FIRST_CHAR"
            : "INVALID_BLOCK_NAME_CHAR";

        if (!RegExp(regEx).test(char)) {
          onError?.(
            createError({
              code,
              start: index,
              end: index,
              value: char,
            })
          );
        }
      }
    } else if (lastStackItem?.type === "(") {
      // No extra characters between function arguments

      if (argCount == 0) {
        onError?.(
          createError({
            code: "NO_CHARS_BEFORE_FIRST_ARG",
            start: index,
            end: index,
            value: char,
          })
        );
      } else {
        onError?.(
          createError({
            code: "NO_CHARS_AFTER_ARG",
            start: index,
            end: index,
            value: char,
          })
        );
      }
    } else if (lastStackItem?.type === ",") {
      // No extra characters between function arguments
      if (char !== '"') {
        onError?.(
          createError({
            code: "NO_CHARS_AFTER_ARG_SEPARATOR",
            start: index,
            end: index,
            value: char,
          })
        );
      }
    }
  }

  if (buffer.length > 0) {
    yield new Token(getTextType(), lastTokenEndIndex + 1, {
      end: index,
      value: buffer,
    });
  }

  if (escapeNext) {
    onError?.(
      createError({
        code: "UNTERMINATED_ESCAPE",
        start: index,
        end: index,
      })
    );
  }

  // Expected token stack to be empty
  const unclosedToken = tokenStack.findLast((token) => token.requiresClosing);
  if (unclosedToken) {
    onError?.(
      createError({
        code: "UNTERMINATED_BLOCK",
        start: unclosedToken.start,
        end: index,
        value: unclosedToken?.type,
      })
    );
  }
}
