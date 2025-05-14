import { BaseExpr } from "./BaseExpr";

export class ConstExpr extends BaseExpr<"constant"> {
  private value: string;
  constructor(start: number, end: number, value: string) {
    super("constant", start, end);
    this.value = value;
  }

  evaluate() {
    return this.value;
  }
}
