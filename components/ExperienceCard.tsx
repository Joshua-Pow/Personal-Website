import React from "react";
import { motion } from "framer-motion";
import ProgrammingLanguages from "./ProgrammingLanguages";

type Props = {
  image: string;
  title: string;
  company: string;
  languages: string[];
  startDate: string;
  endDate?: string;
  summary: string[];
};

function ExperienceCard({
  image,
  title,
  company,
  languages,
  startDate,
  endDate,
  summary,
}: Props) {
  return (
    <div>
      <article className="flex flex-col rounded-lg items-center space-y-7 flex-shrink-0 w-[500px] md:w-[600px] xl:w-[900px] snap-center bg-[#292929] p-10">
        <motion.img
          initial={{ y: -100, opacity: 0 }}
          transition={{ duration: 1.2 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="w-32 h-32 rounded-full xl:w-[200px] xl:h-[200px] object-cover object-center"
          src={image}
          alt={""}
        />

        <div className="px-0 md:px-10">
          <h4 className="text-4xl font-light"> {title} </h4>

          <p className="font-bold text-2xl mt-1">{company}</p>

          <div className="flex space-x-2 my-2">
            <ProgrammingLanguages languages={languages} />
          </div>

          <p className="uppercase py-5 text-grey-300">
            {`Started: ${startDate} - `}{" "}
            {endDate ? `Ended: ${endDate}` : "Current"}
          </p>

          <ul className="list-disc space-y-4 ml-5 text-lg">
            {summary.map((item, index) => (
              <li key={index} className="text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
}

export default ExperienceCard;
