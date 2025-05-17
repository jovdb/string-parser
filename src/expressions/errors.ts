export type ErrorCodes =
  | "UNSUPPORTED"
  | "EMPTY_BLOCK"
  | "UNTERMINATED_BLOCK"
  | "INVALID_BLOCK_NAME_FIRST_CHAR"
  | "INVALID_BLOCK_NAME_CHAR"
  | "NO_CHARS_AFTER_FUNCTION"
  | "NO_CHARS_BEFORE_FIRST_ARG"
  | "NO_CHARS_AFTER_ARG"
  | "NO_CHARS_AFTER_ARG_SEPARATOR"
  | "ARGUMENT_SEPARATOR_REQUIRED"
  | "MISSING_FUNCTION_NAME"
  | "UNTERMINATED_ESCAPE";

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
    case "EMPTY_BLOCK": {
      errorMessage = `Empty block. Remove or add a variable or function name`;
      break;
    }
    case "UNSUPPORTED": {
      errorMessage = `Unsupported: '${value}'`;
      break;
    }
    case "INVALID_BLOCK_NAME_FIRST_CHAR": {
      errorMessage = `Invalid first character for a block name: '${value}', Expected: a letter [a-Z]`;
      break;
    }
    case "INVALID_BLOCK_NAME_CHAR": {
      errorMessage = `Invalid character in block name: '${value}', Expected: Alphanumeric, "_" or "-"`;
      break;
    }
    case "NO_CHARS_AFTER_FUNCTION": {
      errorMessage = `Expected ']' after a function`;
      break;
    }
    case "NO_CHARS_BEFORE_FIRST_ARG": {
      errorMessage = `Expected '"' or ')' `;
      break;
    }
    case "NO_CHARS_AFTER_ARG": {
      errorMessage = `Expected a ',' of ')' `;
      break;
    }
    case "NO_CHARS_AFTER_ARG_SEPARATOR": {
      errorMessage = `Expected '"'`;
      break;
    }
    case "ARGUMENT_SEPARATOR_REQUIRED": {
      errorMessage = `Argument separator required: ','`;
      break;
    }
    case "MISSING_FUNCTION_NAME": {
      errorMessage = `Function name is required`;
      break;
    }
    case "UNTERMINATED_ESCAPE": {
      errorMessage = `Unterminated escape sequence`;
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
