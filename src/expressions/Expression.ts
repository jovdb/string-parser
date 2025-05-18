import { BaseExpr, IEvaluateContext, IEvaluateError } from "./BaseExpr";

export class Expression extends BaseExpr<"expression"> {
  readonly value: string;
  readonly children: BaseExpr<string>[];
  
  constructor(value: string) {
    super("expression", 0, value.length);

    this.value = value;
    this.children = [];
  }

  // public walk(
  //   /** Return true to stop walking */
  //   callback: (item: BaseExpr<string>) => boolean | void | undefined,
  //   method: "depth-first" | "breadth-first" = "depth-first",
  //   expression = this.ast
  // ) {
  //   expression.some((item) => {
  //     if (method === "breadth-first") {
  //       if (callback(item)) return true;
  //     }
  //     if (item.children) {
  //       if (
  //         item.children.some((child) => {
  //           return this.walk(callback, method, child);
  //         })
  //       )
  //         return true;
  //     }
  //     if (method === "depth-first") {
  //       if (callback(item)) return true;
  //     }
  //   });
  // }

  public evaluate(
    context: IEvaluateContext,
    onError?: (error: IEvaluateError) => void
  ): Promise<string> | undefined {
    // Execute
    // Optimizations possible, like fetching all variables upfront
    const promises = this.children!.map((item) => item.evaluate(context, onError));

    // If one returns undefined, also return undefined
    const hasErrors = promises.some((promise) => promise === undefined);
    if (hasErrors) return undefined;

    // Wait for all promises to resolve
    return Promise.all(promises).then((values) => values.join(""));
  }
}
