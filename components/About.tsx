import React from "react";
import { motion } from "framer-motion";

type Props = {};

function About({}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="flex flex-col relative h-screen text-center md:text-left md:flex-row max-w-7xl px-10 justify-evenly mx-auto items-center"
    >
      <h3 className="mb-20 absolute top-24 uppercase tracking-[20px] text-gray-500 text-2xl">
        About
      </h3>

      <motion.img
        initial={{ x: -200, opacity: 0 }}
        transition={{ duration: 1.2 }}
        whileInView={{ x: 0, opacity: 1 }}
        src="../aboutMe.jpg"
        className="-mb-20 md:mb-0 md:mt-20 flex-shrink-0 w-56 h-56 rounded-full object-cover md:rounded-lg md:w-64 md:h-95 xl:w-[500px] xl:h-[600px]"
      />

      <div className="space-y-10 px:0 md:px-10">
        <h4 className="text-4xl font-semibold">
          Here is some{" "}
          <span className="underline decoration-[#683ED8]">info</span> about my
          background{" "}
        </h4>
        <p className="text-sm ">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt
          suscipit veniam assumenda provident enim. Esse quod architecto illo
          reprehenderit voluptatibus et minima nostrum omnis, alias quisquam
          beatae labore explicabo temporibus?
        </p>
      </div>
    </motion.div>
  );
}

export default About;
