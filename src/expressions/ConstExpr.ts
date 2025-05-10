import { BaseExpr } from "./BaseExpr";

export class ConstExpr extends BaseExpr<"constant"> {
  constructor(value: string, start: number, end: number) {
    super("constant", value, start, end);
  }

  evaluate() {
    return this.value;
  }
}
