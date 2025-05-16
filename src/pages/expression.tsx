import { Link } from "waku";
import { ExpressionPage } from "../components/expressions/ExpressionPage";

export default async function Page() {
  return (
    <>
      <title>Expression</title>
      <Link to="/">Home</Link>
      <ExpressionPage />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
