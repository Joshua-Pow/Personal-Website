import React from "react";
import { motion } from "framer-motion";
import ProgrammingLanguages from "./ProgrammingLanguages";
import { JobData } from "@/jobData";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  variants: {
    visible: {
      scale: number;
      boxShadow: string;
      y: string;
      x: string;
      cursor: string;
      transition: { duration: number; type: string };
    };
  };
  data: JobData | null;
};

function ExperienceBig({ open, setOpen, variants, data }: Props) {
  return (
    <motion.div
      className="z-2 absolute flex h-96 w-3/4 flex-shrink-0 cursor-pointer flex-col items-center
              space-y-7 overflow-y-scroll rounded-lg bg-[#292929] p-10 transition-opacity
              duration-200 sm:w-[300px] md:h-1/2 md:w-[600px] xl:w-[900px]"
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
        className="img-fluid h-32 w-32 md:h-32 md:w-32 xl:h-[200px] xl:w-[200px]"
        src={data?.image}
        alt={""}
      />

      <motion.div className="px-0 md:px-10">
        <motion.h4 className="text-xl font-light md:text-4xl">
          {data!.title} <br /> {data!.team}
        </motion.h4>

        <motion.div>
          <p className="mt-1 text-xl font-bold md:text-2xl">{data?.company}</p>
          <div className="my-2 flex space-x-2">
            <ProgrammingLanguages languages={data!.languages} />
          </div>

          <p className="text-grey-300 pb-5 uppercase">
            {` ${data?.startDate} - `}{" "}
            {data?.endDate ? `${data?.endDate}` : "Current"}
          </p>

          <ul className="ml-2 list-disc space-y-4">
            {data?.summary.map((item, index) => (
              <li key={index} className="text-xs md:text-sm">
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ExperienceBig;
