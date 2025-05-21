import { ExpressionPage } from "../components/expressions/ExpressionPage";

export default async function Page() {
  return (
    <>
      <title>Expression</title>
      <ExpressionPage />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
