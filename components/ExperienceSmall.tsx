import React from "react";
import { motion } from "framer-motion";
import { JobData } from "../src/jobData";

type Props = {
  key: number;
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

function ExperienceSmall({ key, setOpen, open, setData, job, item }: Props) {
  return (
    <motion.div
      layout
      className="flex z-100 flex-col rounded-lg items-center
                  w-[300px] md:w-[600px] xl:w-[900px] bg-[#292929]
                  p-10 cursor-pointer transition-opacity duration-200"
      onClick={() => {
        setOpen(!open);
        setData(job);
      }}
      variants={item}
      key={key}
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
}

export default ExperienceSmall;
