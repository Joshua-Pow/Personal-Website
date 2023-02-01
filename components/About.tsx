import React from "react";
import { motion } from "framer-motion";

type Props = {};

function About({}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="pt-20 flex flex-col relative h-screen text-center md:text-left md:flex-row max-w-7xl px-10 justify-evenly mx-auto items-center"
    >
      <h3 className="uppercase mr-8 tracking-[20px] text-gray-500 text-2xl">
        About
      </h3>

      <motion.img
        initial={{ x: -200, opacity: 0 }}
        transition={{ duration: 1.2 }}
        whileInView={{ x: 0, opacity: 1 }}
        src="../aboutMe.jpg"
        className="flex-shrink-0 w-56 h-56 rounded-full object-cover md:rounded-lg md:w-64 md:h-95 xl:w-[500px] xl:h-[600px]"
      />

      <div className="space-y-10 px:0 md:px-10">
        <h4 className="text-4xl font-semibold">
          Here is some{" "}
          <span className="underline decoration-[#683ED8]">info</span> about my
          background{" "}
        </h4>
        <p className="text-sm ">
          I am a third year computer engineering student at the University of
          Toronto with a passion for everything and anything Software. I am
          currently looking for a co-op position for the summer of 2023. I have
          experience with a variety of technologies and languages including
          React, C++, C, Python, JavaScript and am currently learning TypeScript
          (which is what this website is made in!). I am also familiar with the
          Agile development process and have over 1+ year of experience working
          in a team environment. I am a quick learner and am always looking for
          new technologies to learn.
        </p>
      </div>
    </motion.div>
  );
}

export default About;
