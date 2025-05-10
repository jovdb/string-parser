import { BaseExpr } from "./BaseExpr";

export class VarExpr extends BaseExpr<"variable"> {
  readonly name: string;
  constructor(value: string, start: number, end: number, name: string) {
    super("variable", value, start, end);
    this.name = name;
  }

  evaluate() {
    return this.value;
  }
}
