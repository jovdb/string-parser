import { BaseExpr, type IEvaluateContext, type IEvaluateError } from "./BaseExpr";

export class VarExpr extends BaseExpr<"variable"> {
  readonly name: string;
  constructor(start: number, end: number, name: string) {
    super("variable", start, end);
    this.name = name;
  }

  async evaluate(
    context: IEvaluateContext,
    onError?: (error: IEvaluateError) => void
  ): Promise<string | undefined> {
    const fn = context.variables[this.name];
    if (fn === undefined) {
      onError?.({
        code: "UNKNOWN_VARIABLE",
        start: this.start,
        end: this.end,
        message: `Unknown variable '${
          this.name
        }'. Available variables: ${Object.keys(context.variables).join(", ")}`,
      });
      return undefined;
    }

    try {
      return await fn();
    } catch (error) {
      onError?.({
        code: "FUNCTION_ERROR",
        start: this.start,
        end: this.end,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message: `Error executing variable '${this.name}': ${(error as any).message}`,
      });
      return undefined;
    }
  }
}
