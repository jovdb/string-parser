// import { BaseExpr } from "./BaseExpr";
import { BaseExpr, IEvaluateContext, IEvaluateError } from "./BaseExpr";
import { Expression } from "./Expression";

export class FuncExpr extends BaseExpr<"func"> {
  readonly name: string;
  readonly children: Expression[];

  constructor(start: number, end: number, name: string) {
    super("func", start, end);
    this.name = name;
    this.children = [];
  }

  async evaluate(
    context: IEvaluateContext,
    onError?: (error: IEvaluateError) => void
  ) {
    const fn = context.functions[this.name];
    if (fn === undefined) {
      onError?.({
        code: "UNKNOWN_FUNCTION",
        start: this.start,
        end: this.end,
        message: `Unknown function '${
          this.name
        }'. Available functions: ${Object.keys(context.functions).join(", ")}`,
      });
      return undefined;
    }

    // Evaluate Arguments
    const args = await Promise.all(
      this.children.map((child) => child.evaluate(context, onError))
    );
    if (args.some((arg) => arg === undefined)) return undefined;

    try {
      return await fn(...(args.filter((arg) => arg !== undefined) as string[]));
    } catch (error) {
      onError?.({
        code: "FUNCTION_ERROR",
        start: this.start,
        end: this.end,
        message: `Error executing function '${this.name}': ${error.message}`,
      });
      return undefined;
    }
  }
}
