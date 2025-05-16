// Split in parts

import { createError, ISyntaxError } from "./Expression";

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
  let tokenStack: IToken[] = [];
  let index = -1;
  let lastTokenEndIndex = -1;
  let argCount = 0;

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

    if (char === "\\") {
      escapeNext = true;
      continue;
    } else if (escapeNext) {
      // Add to buffer, don't interpret as special char
      buffer += char;
      escapeNext = false;
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
        continue;
      }
    } else if (char === '"') {
      if (lastStackItem?.type === "(" || lastStackItem?.type === ",") {
        if (argCount > 0) {
          // Before " argument separator
          const beforeToken = getBeforeToken();
          if (beforeToken) {
            yield beforeToken;
          }
        }

        // onError?.(
        //   createError({
        //     code: "ARGUMENT_SEPARATOR_REQUIRED",
        //     start: index,
        //     end: index,
        //   })
        // );
        // Argument start
        const token = new Token(char, index, {
          requiresClosing: true,
        });
        tokenStack.push(token);
        lastTokenEndIndex = index;
        yield token;
        argCount = 0;
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

        yield token;
        continue;
      } else {
        debugger;
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

    if (lastStackItem?.type === "[") {
      // If we are building a block name
      const regEx = buffer.length === 1 ? "^[a-zA-Z]" : "^[a-zA-Z0-9-_*]$";
      if (!RegExp(regEx).test(char)) {
        onError?.(
          createError({
            code: "INVALID_BLOCK_NAME_FIRST_CHAR",
            start: index,
            end: index,
            value: char,
          })
        );
      }
    } else if (lastStackItem?.type === ")") {
      // After a function
      onError?.(
        createError({
          code: "NO_CHARS_AFTER_FUNCTION",
          start: index,
          end: index,
        })
      );
    } else if (lastStackItem?.type === "(") {
      // No extra characters between function arguments
      onError?.(
        createError({
          code: "NO_CHARS_BETWEEN_ARGUMENTS",
          start: index,
          end: index,
          value: char,
        })
      );
    }
  }

  if (buffer.length > 0) {
    yield new Token(getTextType(), lastTokenEndIndex + 1, {
      end: index,
      value: buffer,
    });
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
