export interface IExprItem<TType extends string = string> {
  readonly type: TType;
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

export abstract class BaseExpr<TType extends string>
  implements IExprItem<TType>
{
  readonly type: TType;
  readonly value: string;
  readonly start: number;
  readonly end: number;

  constructor(type: TType, value: string, start: number, end: number) {
    this.type = type;
    this.value = value;
    this.start = start;
    this.end = end;
  }

  abstract evaluate(): string;
}
