// Split in parts

import { createError, ISyntaxError } from "./Expression";

export interface IBlockStartToken<TType extends TokenType = TokenType> {
  type: TType;
  start: number;
}

export interface IToken<TType extends TokenType = TokenType>
  extends IBlockStartToken<TType> {
  end: number;
}

export class Token<TType extends TokenType> implements IToken<TType> {
  type: TType;
  start: number;
  end: number;

  constructor(type: TType, start: number, end: number, value: string) {
    this.type = type;
    this.start = start;
    this.end = end;
  }
}

export type TokenType =
  | "constant"
  | "name" // function or variable name
  | "("
  | ")"
  | "["
  | "]"
  | '"'
  | ",";

export function* lexer(
  input: string,
  onError: ((error: ISyntaxError) => void) | undefined
) {
  let buffer = "";
  let escapeNext = false;
  let tokenStack: IBlockStartToken[] = [];
  let index = -1;
  let lastTokenEndIndex = -1;

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
      buffer = "";
      return new Token(getTextType(), lastTokenEndIndex + 1, index - 1, buffer);
    }
    return undefined;
  }

  for (const char of input) {
    index++;
    const lastStackItem = tokenStack.at(-1);

    if (escapeNext) {
      buffer += char;
      escapeNext = false;
      continue;
    } else if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === "[") {
      if (
        // new block
        tokenStack.length === 0 ||
        // function argument
        lastStackItem?.type === "("
      ) {
        // Before [
        const beforeToken = getBeforeToken();
        if (beforeToken) {
          yield beforeToken;
        }

        // Variable or function start
        const token = new Token(char, index, index, buffer);
        tokenStack.push(token);
        lastTokenEndIndex = index;
        yield token;
        continue;
      }
    } else if (char === "(") {
      if (lastStackItem?.type === "[") {
        // Before (
        const beforeToken = getBeforeToken();
        if (beforeToken) {
          yield beforeToken;
        }

        // Function start
        const token = new Token(char, index, index, buffer);
        tokenStack.push(token);
        lastTokenEndIndex = index;
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
        const token = new Token(char, index, index, buffer);
        tokenStack.pop(); // Remove [
        lastTokenEndIndex = index;
        yield token;
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
        const token = new Token(char, index, index, buffer);
        tokenStack.pop(); // remove (
        lastTokenEndIndex = index;
        yield token;
        continue;
      }
    }

    // Validate allowed input characters

    if (lastStackItem?.type === "[") {
      // If we are building a block name
      if (!RegExp("[a-zA-Z0-9-_]").test(char)) {
        onError?.(
          createError({
            code: "INVALID_BLOCK_NAME_CHAR",
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
        })
      );
    }

    // Normal character
    buffer += char;
  }

  if (buffer.length > 0) {
    yield new Token(getTextType(), lastTokenEndIndex + 1, index, buffer);
  }

  // Expected token stack to be empty
  if (tokenStack.length > 0) {
    const lastToken = tokenStack.at(-1)!;
    onError?.(
      createError({
        code: "UNTERMINATED_BLOCK",
        start: lastToken.start,
        end: lastToken.start,
        value: lastToken?.type,
      })
    );
  }
}
