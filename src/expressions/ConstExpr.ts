import { BaseExpr } from "./BaseExpr";

export class ConstExpr extends BaseExpr<"constant"> {
  value: string;
  constructor(start: number, end: number, value: string) {
    super("constant", start, end);
    this.value = value;
  }

  async evaluate() {
    return this.value;
  }
}
