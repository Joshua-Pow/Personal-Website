export const jobData = [
    {
      image: "./rbc.svg",
      title: "2021 Summer Dev",
      team: "FICC Cash Analytics",
      id: "rbc2021",
      company: "RBC",
      languages: ["flask", "cpp", "python", "react"],
      startDate: "May 2021",
      endDate: "August 2021",
      summary: [
        "Implemented and performance tested a C++ JSON parser against 260,000+ bonds for an increase of 200% in performance to be used in a company-wide bond parsing program",
        "Categorized and sorted 40,000+ bonds using NumPy and Pandas in Python as well as MS Excel",
        "Developed a react based website with a python backend to visualize and more efficiently search 500+ log files",
      ],
    },
    {
      image: "./citi.svg",
      title: "2022 Summer Dev",
      team: "Alpha Capture",
      id: "citi2022",
      company: "Citi",
      languages: ["java", "springboot", "python", "react", "mui", "oracle"],
      startDate: "May 2022",
      endDate: "August 2022",
      summary: [
        "Made a full stack web application using Python(Flask), Java(spring), React.js and oracle database that queries our team's database of 400k+ records using search parameters such as date and time and returns formatted information in a table which can be exported as CSV or excel",
        "Wrote python scripts using Pywin and Cx_Oracle to automatically catch missed information in our oracle database and generate the correct information in an email forwarded to the team",
        "Filtered and cleaned 100k+ trade ideas using Python and Pandas",
        "Generated tables, stored procedures and queries using python and SQL within an oracle database",
      ],
    },
    {
      image: "./rbc.svg",
      title: "2023 Fall/Winter Dev",
      team: "Data Fabrication",
      id: "rbc2022",
      company: "RBC",
      languages: ["react", "python", "flask"],
      startDate: "September 2022",
      summary: ["In progress"],
    },
  ];
  
  export type JobData = {
    image: string;
    title: string;
    team: string;
    id: string;
    company: string;
    languages: string[];
    startDate: string;
    endDate?: string;
    summary: string[];
  };
  
  
  
  