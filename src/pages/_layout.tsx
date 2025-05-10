import "../styles.css";

import type { ReactNode } from "react";

import { Header } from "../components/header";
import { Footer } from "../components/footer";

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  return <div>{children}</div>;
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
