import { BaseExpr } from "./BaseExpr";

export class FuncExpr extends BaseExpr<"func"> {
  readonly name: string;

  constructor(start: number, end: number, name: string) {
    super("func", start, end);
    this.name = name;
  }

  evaluate() {
    return `SWAP(${this.name}())`;
  }
}

/*
const functionArgsStart = "(";
const functionArgsEnd = ")";

export function parseFunction(
  value: string,
  offsetIndex = 0
): { item?: FuncExpr; error?: ParseError } {
  let index = 0;
  let item: FuncExpr | undefined;
  let error: ParseError | undefined;
  let name = "";
  let args = "";

  const stack: {
    type: typeof functionArgsStart;
    index: number;
  }[] = [];
  for (index = 0; index < value.length; index++) {
    const char = value[index];
    switch (char) {
      case functionArgsStart: {
        if (name) {
          error = {
            message: `Unexpected character '${functionArgsEnd}'.`,
            start: offsetIndex + index + 1,
            end: offsetIndex + index + 1,
          };
          break;
        }
        name = value.substring(0, index - 1);
        if (!name.trim()) break;
        break;
      }
      case functionArgsEnd: {
        if (!name) break;
        // TODO:
        args;
        break;
      }
    }
  }

  if (!name.trim()) {
    error = {
      message: `Function name expected`,
      start: offsetIndex + 1,
      end: offsetIndex + (index === 0 ? 1 : index),
    };
  }

  if (name) {
    item = new FuncExpr(
      value,
      offsetIndex,
      offsetIndex + value.length + 1,
      name
    );
  }

  return {
    item,
    error,
  };
}
*/
