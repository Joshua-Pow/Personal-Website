import React from "react";
import { motion } from "framer-motion";
import ExperienceCard from "./ExperienceCard";

type Props = {};

function Experience({}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="h-screen flex pt-40 md:pt-0 relative overflow-hidden 
      flex-col text-left md:flex-row max-w-full px-10 justify-evenly mx-auto items-center"
    >
      <h3 className="absolute top-24 uppercase tracking-[20px] text-gray-500 text-2xl">
        Experience
      </h3>

      <div className="w-full flex space-x-5 overflow-x-scroll p-10 snap-x snap-mandatory">
        <ExperienceCard
          image={"./rbc.svg"}
          title={"Technical Business Analyst"}
          company={"RBC"}
          languages={["flask", "cpp", "python", "react"]}
          startDate={"May 2021"}
          endDate={"August 2021"}
          summary={[
            "Implemented and performance tested a C++ JSON parser against 260,000+ bonds for an increase of 200% in performance to be used in a company-wide bond parsing program",
            "Categorized and sorted 40,000+ bonds using NumPy and Pandas in Python as well as MS Excel",
            "Developed a react based website with a python backend to visualize and more efficiently search 500+ log files",
          ]}
        />
        <ExperienceCard
          image={"./citi.svg"}
          title={"Technology Summer Analyst"}
          company={"Citi"}
          languages={["java", "springboot", "python", "react", "mui", "oracle"]}
          startDate={"May 2022"}
          endDate={"August 2022"}
          summary={[
            "Made a full stack web application using Python(Flask), Java(spring), React.js and oracle database that queries our team's database of 400k+ records using search parameters such as date and time and returns formatted information in a table which can be exported as CSV or excel",
            "Wrote python scripts using Pywin and Cx_Oracle to automatically catch missed information in our oracle database and generate the correct information in an email forwarded to the team",
            "Filtered and cleaned 100k+ trade ideas using Python and Pandas",
            "Generated tables, stored procedures and queries using python and SQL within an oracle database",
          ]}
        />
        <ExperienceCard
          image={"./rbc.svg"}
          title={"Technical Business Analyst"}
          company={"RBC"}
          languages={["react", "python", "flask"]}
          startDate={"September 2022"}
          summary={["In progress"]}
        />
      </div>
    </motion.div>
  );
}

export default Experience;
