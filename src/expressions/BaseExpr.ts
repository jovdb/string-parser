export interface IExprItem<TType extends string = string> {
  readonly type: TType;
  readonly start: number;
  readonly end: number;
}

export abstract class BaseExpr<TType extends string>
  implements IExprItem<TType>
{
  readonly type: TType;
  readonly start: number;
  readonly end: number;

  constructor(type: TType, start: number, end: number) {
    this.type = type;
    this.start = start;
    this.end = end;
  }

  abstract evaluate(): string;
}
