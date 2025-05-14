import { Link } from "waku";
import { ExpressionPage } from "../components/expressions/ExpressionPage";
import { IExprItem } from "../expressions/BaseExpr";
import { readFileSync } from "fs";

export default async function Page() {
  const fileContent = readFileSync("./private/expressions.json", "utf8");
  const expressions: [string, { items: IExprItem[]; error?: SyntaxError }][] =
    JSON.parse(fileContent);
  return (
    <>
      <title>Expression</title>
      <Link to="/">Home</Link>
      <ExpressionPage expressions={expressions} />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};

async function getData() {
  const res = await fetch("./Expressions.json");
  if (!res.ok) {
    throw new Error("Failed to fetch expressions");
  }
  return res.json() as Promise<
    [
      expression: string,
      expected: {
        items: IExprItem[];
        error?: SyntaxError;
      }
    ][]
  >;
}
