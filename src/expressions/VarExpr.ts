import { BaseExpr } from "./BaseExpr";

export class VarExpr extends BaseExpr<"variable"> {
  readonly name: string;
  constructor(start: number, end: number, name: string) {
    super("variable", start, end);
    this.name = name;
  }

  evaluate() {
    return `SWAP(${this.name})`;
  }
}
