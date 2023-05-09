import React from "react";
import { motion } from "framer-motion";
import { JobData } from "../src/jobData";

type Props = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setData: React.Dispatch<React.SetStateAction<JobData | null>>;
  open: boolean;
  item: {
    hidden: {
      y: number;
      opacity: number;
    };
  };
  job: JobData;
};

function ExperienceSmall({ setOpen, open, setData, job, item }: Props) {
  return (
    <motion.div
      layout
      className="z-100 flex w-[300px] cursor-pointer flex-col
                  items-center rounded-lg bg-[#292929] p-10
                  transition-opacity duration-200 md:w-[600px] xl:w-[900px]"
      onClick={() => {
        setOpen(!open);
        setData(job);
      }}
      variants={item}
    >
      <motion.img
        className="mb-3 h-32 w-32 object-cover object-center sm:mb-0 md:h-[150px] md:w-[150px]"
        src={job.image}
        alt={""}
      />

      <motion.h4 className="px-0 text-center text-xl font-light md:px-10 md:text-4xl">
        {job.title} <br /> {job.team}
      </motion.h4>
    </motion.div>
  );
}

export default ExperienceSmall;
