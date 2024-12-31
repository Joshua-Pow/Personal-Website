import React from "react";
import { AnimatedName } from "../../components/AnimatedName";

export const metadata = {
  title: "History",
  alternates: {
    canonical: "/history",
  },
};

const page = () => {
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
