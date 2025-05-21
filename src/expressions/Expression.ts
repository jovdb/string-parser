import { BaseExpr, IEvaluateContext, IEvaluateError } from "./BaseExpr";

export class Expression extends BaseExpr<"expression"> {
  readonly value: string;
  readonly children: BaseExpr<string>[];

  constructor(value: string) {
    super("expression", 0, value.length);

    this.value = value;
    this.children = [];
  }

  public async evaluate(
    context: IEvaluateContext,
    onError?: (error: IEvaluateError) => void
  ) {
    // Execute
    // Optimizations possible, like fetching all variables upfront
    const promises = this.children!.map((item) =>
      item.evaluate(context, onError)
    );

    // If one returns undefined, also return undefined
    const hasErrors = promises.some((promise) => promise === undefined);
    if (hasErrors) return undefined;

    // Wait for all promises to resolve
    const values = await Promise.all(promises);
    return values.join("");
  }
}
