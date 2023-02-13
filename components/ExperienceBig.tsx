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
      className="h-96 md:h-1/2 flex z-2 flex-col absolute rounded-lg items-center space-y-7
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
          <p className="font-bold text-xl md:text-2xl mt-1">{data?.company}</p>
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
  );
}

export default ExperienceBig;
