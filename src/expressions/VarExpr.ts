import { BaseExpr, IEvaluateContext, IEvaluateError } from "./BaseExpr";

export class VarExpr extends BaseExpr<"variable"> {
  readonly name: string;
  constructor(start: number, end: number, name: string) {
    super("variable", start, end);
    this.name = name;
  }

  evaluate(
    context: IEvaluateContext,
    onError?: (error: IEvaluateError) => void
  ): Promise<string> | string | undefined {
    const fn = context.variables[this.name];
    if (fn === undefined) {
      onError?.({
        code: "UNKNOWN_VARIABLE",
        message: `Unknown variable '${this.name}'`,
      });
      return undefined;
    }
    return fn();
  }
}
