import React from "react";
import { AnimatedName } from "../components/AnimatedName";

export const metadata = {
  title: "History",
  alternates: {
    canonical: "/history",
  },
};

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <h1 className="pt-12">History</h1>
      <AnimatedName />
      <p>
        I&apos;m a software engineer with a passion for building products that
        make a difference.
      </p>
    </div>
  );
};

export default page;
