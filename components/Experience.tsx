import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExperienceCard from "./ExperienceCard";
import { jobData } from "../src/jobData";
import ProgrammingLanguages from "./ProgrammingLanguages";

type Props = {};

function Experience({}: Props) {
  const [data, setData] = useState<{
    image: string;
    title: string;
    id: string;
    company: string;
    languages: string[];
    startDate: string;
    endDate?: string;
    summary: string[];
  } | null>(null);
  const [open, setOpen] = useState(false);

  // animation for list
  const container = {
    hidden: { opacity: 1, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };
  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  //  animation for  popup

  const variants = {
    visible: {
      scale: 1.1,
      boxShadow: "10px 10px 0 rgba(0, 0, 0, 0.2)",
      //center the card
      y: "-10%",
      x: "-35%",
      cursor: "pointer",
      transition: { duration: 1, type: "spring" },
    },
    hidden: { scale: 1, opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="h-screen max-w-full flex flex-col pt-40 px-10 md:pt-0 relative overflow-hidden 
      md:flex-row justify-evenly mx-auto items-center"
    >
      <h3 className="absolute top-24 uppercase tracking-[20px] text-gray-500 text-2xl">
        Experience
      </h3>

      <section className="mx-auto mt-5">
        <motion.div
          style={{
            filter: open ? "blur(2px)" : "none",
          }}
          className="h-96 md:h-[60vh] flex flex-col space-y-5 items-center overflow-y-scroll snap-y snap-mandatory snap-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {jobData.map((job, index) => {
            return (
              <motion.div
                layout
                key={index}
                className="flex z-100 flex-col rounded-lg items-center
                  w-[300px] md:w-[600px] xl:w-[900px] bg-[#292929]
                  p-10 cursor-pointer transition-opacity duration-200"
                onClick={() => {
                  setOpen(!open);
                  setData(job);
                }}
                variants={item}
              >
                <motion.img
                  className="w-32 h-32 mb-3 sm:mb-0 md:w-[150px] md:h-[150px] object-cover object-center"
                  src={job.image}
                  alt={""}
                />

                <motion.h4 className="text-xl text-center md:text-4xl font-light px-0 md:px-10">
                  {job.title} <br /> {job.team}
                </motion.h4>
              </motion.div>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                className="h-96 md:h-auto flex z-2 flex-col absolute rounded-lg items-center space-y-7
              flex-shrink-0 w-3/4 sm:w-[300px] md:w-[600px] xl:w-[900px] bg-[#292929]
              p-10 cursor-pointer transition-opacity duration-200 overflow-y-scroll"
                style={{
                  position: "fixed",
                  top: "30%",
                  left: "40%",
                }}
                onClick={() => {
                  setOpen(!open);
                }}
                variants={variants}
                animate={open ? "visible" : "hidden"}
                exit={{ scale: 1, opacity: 0 }}
              >
                <motion.img
                  className="w-32 h-32 md:w-32 md:h-32 xl:w-[200px] xl:h-[200px] img-fluid"
                  src={data?.image}
                  alt={""}
                />

                <motion.div className="px-0 md:px-10">
                  <motion.h4 className="text-xl md:text-4xl font-light">
                    {data!.title} <br /> {data!.team}
                  </motion.h4>

                  <motion.div>
                    <p className="font-bold text-xl md:text-2xl mt-1">
                      {data?.company}
                    </p>
                    <div className="flex space-x-2 my-2">
                      <ProgrammingLanguages languages={data!.languages} />
                    </div>

                    <p className="uppercase pb-5 text-grey-300">
                      {` ${data?.startDate} - `}{" "}
                      {data?.endDate ? `${data?.endDate}` : "Current"}
                    </p>

                    <ul className="list-disc space-y-4 ml-2">
                      {data?.summary.map((item, index) => (
                        <li key={index} className="text-xs md:text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}

export default Experience;
