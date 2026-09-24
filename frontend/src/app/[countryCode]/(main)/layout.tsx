import { Metadata } from "next";

import { getBaseURL } from "@lib/util/env";
import Footer from "@modules/layout/templates/footer/footer";
import Nav from "@modules/layout/templates/nav/nav";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
};

export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {props.children}
      <Footer />
    </>
  );
}
