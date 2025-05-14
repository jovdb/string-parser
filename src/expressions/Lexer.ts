// Split in parts

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

export function* lexer(input: string) {
  let buffer = "";
  let escapeNext = false;
  let stack: IBlockStartToken[] = [];
  let index = -1;
  let lastTokenEndIndex = -1;

  function getTextType() {
    if (stack.length === 0) {
      return "constant";
    }
    const lastToken = stack.at(-1);
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

    if (escapeNext) {
      buffer += char;
      escapeNext = false;
    } else if (char === "\\") {
      escapeNext = true;
    } else if (char === "[" && stack.length === 0) {
      // Variable or function start
      // Before [
      const beforeToken = getBeforeToken();
      if (beforeToken) {
        yield beforeToken;
      }

      const token = new Token(char, index, index, buffer);
      stack.push(token);
      lastTokenEndIndex = index;
      yield token;
    } else if (char === "(" && stack.at(-1)?.type === "[") {
      // Function start
      // Before (
      const beforeToken = getBeforeToken();
      if (beforeToken) {
        yield beforeToken;
      }

      const token = new Token(char, index, index, buffer);
      stack.push(token);
      lastTokenEndIndex = index;
      yield token;
    } else if (char === "]" && stack.at(-1)?.type === "[") {
      // Variable or function end
      // Before [
      const beforeToken = getBeforeToken();
      if (beforeToken) {
        yield beforeToken;
      }

      const token = new Token(char, index, index, buffer);
      stack.pop();
      lastTokenEndIndex = index;
      yield token;
    } else if (char === ")" && stack.at(-1)?.type === "(") {
      // Function arguments end
      // Before [
      const beforeToken = getBeforeToken();
      if (beforeToken) {
        yield beforeToken;
      }

      const token = new Token(char, index, index, buffer);
      stack.pop();
      lastTokenEndIndex = index;
      yield token;
    } else {
      // Normal character
      buffer += char;
    }
  }

  if (buffer.length > 0) {
    yield new Token(getTextType(), lastTokenEndIndex + 1, index, buffer);
  }
}
