import React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProgrammingLanguages from "./ProgrammingLanguages";

type Props = {
  image: string;
  title: string;
  id: string;
  company: string;
  languages: string[];
  startDate: string;
  endDate?: string;
  summary: string[];
};

function ExperienceCard({
  image,
  title,
  id,
  company,
  languages,
  startDate,
  endDate,
  summary,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      className="flex flex-col rounded-lg items-center space-y-7 
      flex-shrink-0 w-[300px] md:w-[600px] xl:w-[900px] bg-[#292929] 
      p-10 hover:opacity-100 opacity-40 cursor-pointer transition-opacity duration-200"
      onClick={() => setIsOpen(!isOpen)}
      layoutId={id}
      transition={{ layout: { duration: 0.8, type: "spring" } }}
      layout
    >
      <motion.img
        initial={{ y: -100, opacity: 0 }}
        transition={{ duration: 1.2 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="w-32 h-32 xl:w-[200px] xl:h-[200px] object-cover object-center"
        src={image}
        layout="position"
        alt={""}
      />

      <div className="px-0 md:px-10">
        <motion.h4 className="text-4xl font-light" layout="position">
          {" "}
          {title}{" "}
        </motion.h4>

        {isOpen && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-bold text-2xl mt-1">{company}</p>
              <div className="flex space-x-2 my-2">
                <ProgrammingLanguages languages={languages} />
              </div>

              <p className="uppercase py-5 text-grey-300">
                {` ${startDate} - `} {endDate ? `${endDate}` : "Current"}
              </p>

              <ul className="list-disc space-y-4 ml-5 text-lg">
                {summary.map((item, index) => (
                  <li key={index} className="text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

export default ExperienceCard;
