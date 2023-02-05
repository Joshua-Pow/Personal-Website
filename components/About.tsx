import React from "react";
import { motion } from "framer-motion";

type Props = {};

function About({}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="pt-32 flex flex-col relative h-screen text-center md:text-left md:flex-row md:gap-8 max-w-7xl px-10 justify-evenly mx-auto items-center"
    >
      <h3 className="top-[120px] absolute uppercase tracking-[20px] mr-[-20px] text-gray-500 text-2xl">
        About
      </h3>

      <motion.img
        initial={{ x: -200, opacity: 0 }}
        transition={{ duration: 1.2 }}
        whileInView={{ x: 0, opacity: 1 }}
        src="../aboutMe.jpg"
        className="w-44 h-44 sm:w-96 sm:h-96 rounded-full object-cover md:rounded-lg md:w-64 md:h-95 xl:w-[500px] xl:h-[600px]"
      />

      <div className="space-y-4 sm:space-y-10 mt-[-5rem]">
        <h4 className="text-2xl sm:text-4xl font-semibold">
          Some <span className="underline decoration-[#683ED8]">info</span>{" "}
          about me{" "}
        </h4>
        <p className="text-xs sm:text-sm ">
          I am a{" "}
          <b className="text-[#d3bdf4]">
            third year computer engineering student at the University of Toronto
          </b>{" "}
          with a passion for everything and anything Software. I am currently
          looking for a{" "}
          <b className="text-[#d3bdf4]">
            co-op position for the summer of 2023
          </b>
          . I have experience with a variety of technologies and languages
          including&nbsp;
          <b className="text-[#d3bdf4]">
            React, C++, C, Python, JavaScript and am currently learning
            TypeScript&nbsp;
          </b>
          (which is what this website is made in!). I am also familiar with the
          Agile development process and have over{" "}
          <b className="text-[#d3bdf4]">1+ year of experience &nbsp;</b>
          working in a team environment. I am a quick learner and am always
          looking for new technologies to learn.
        </p>
      </div>
    </motion.div>
  );
}

export default About;
