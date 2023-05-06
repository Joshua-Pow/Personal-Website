import React from "react";
import Header from "components/Header";
import { motion } from "framer-motion";

type Props = {};

function playground({}: Props) {
  return (
    <div className="min-h-screen bg-[rgb(36,36,36)] text-white">
      <Header />
      <div className="flex flex-col">
        <div className="mb-10 flex w-screen justify-center">
          <h1 className="text-3xl">Playground</h1>
        </div>
        <motion.div className="w-90% flex h-full flex-wrap justify-center gap-2">
          <div className="h-[260px] w-[300px] cursor-pointer rounded-lg border-2 border-solid border-white/10 bg-[rgb(255,255,255)/100] "></div>
          <div className="h-[260px] w-[300px] cursor-pointer rounded-lg border-2 border-solid border-white/10 bg-[rgb(255,255,255)/100]"></div>
        </motion.div>
      </div>
    </div>
  );
}

export default playground;
