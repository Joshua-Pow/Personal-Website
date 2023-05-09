import React from "react";
import { motion } from "framer-motion";

type Props = {};

function About({}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative mx-auto flex h-screen max-w-7xl flex-col items-center justify-evenly px-10 pt-32 text-center md:flex-row md:gap-8 md:text-left"
    >
      <h3 className="absolute top-[120px] mr-[-20px] text-2xl uppercase tracking-[20px] text-gray-500">
        About
      </h3>

      <motion.img
        initial={{ x: -200, opacity: 0 }}
        transition={{ duration: 1.2 }}
        whileInView={{ x: 0, opacity: 1 }}
        src="../aboutMe.jpg"
        className="md:h-95 h-44 w-44 rounded-full object-cover sm:h-96 sm:w-96 md:w-64 md:rounded-lg xl:h-[600px] xl:w-[500px]"
      />

      <div className="mt-[-3rem] space-y-4 sm:space-y-10">
        <h4 className="text-2xl font-semibold sm:text-4xl">
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
