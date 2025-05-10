import { Link } from "waku";

export default async function ExpressionPage() {
  return (
    <div>
      <title>Expression</title>
      <Link to="/">Home</Link>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
