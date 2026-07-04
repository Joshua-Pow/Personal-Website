import { AnimatedName } from "@/components/AnimatedName";
import React from "react";

export const metadata = {
  title: "Notes",
  alternates: {
    canonical: "/notes",
  },
};

const page = () => {
  return (
    <div className="flex h-full flex-col px-8">
      <h1 className="pt-12 font-medium">Notes</h1>
      <AnimatedName />
      <p>A timeline of my thoughts and ideas.</p>
    </div>
  );
};

export default page;
