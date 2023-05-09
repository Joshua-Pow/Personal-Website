import { useState } from "react";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExperienceBig from "./ExperienceBig";
import { jobData } from "../src/jobData";
import { JobData } from "../src/jobData";
import ExperienceSmall from "./ExperienceSmall";

type Props = {};

function Experience({}: Props) {
  const [data, setData] = useState<JobData | null>(null);
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
      className="relative mx-auto flex h-screen max-w-full flex-col items-center justify-evenly overflow-hidden 
      px-10 pt-40 md:flex-row md:pt-0"
    >
      <h3 className="absolute top-[120px] mr-[-20px] text-2xl uppercase tracking-[20px] text-gray-500">
        Experience
      </h3>

      <section className="mx-auto mt-5">
        <motion.div
          style={{
            filter: open ? "blur(2px)" : "none",
          }}
          className="flex h-96 snap-y snap-mandatory snap-center flex-col items-center space-y-5 overflow-y-scroll md:h-[60vh]"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {jobData.map((job, index) => {
            return (
              <React.Fragment key={index}>
                <ExperienceSmall
                  setOpen={setOpen}
                  open={open}
                  setData={setData}
                  job={job}
                  item={item}
                />
              </React.Fragment>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {open && (
            <>
              <ExperienceBig
                open={open}
                setOpen={setOpen}
                variants={variants}
                data={data}
              />
            </>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}

export default Experience;
