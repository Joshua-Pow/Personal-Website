import { AnimatedName } from "@/components/AnimatedName";
import { WorkExperience } from "@/components/WorkExperience";

export const metadata = {
  title: "Work History",
  alternates: {
    canonical: "/history",
  },
};

const page = () => {
  return (
    <div className="flex h-full flex-col px-8">
      <h1 className="pt-12 font-medium">History</h1>
      <AnimatedName />
      <p className="motion-preset-slide-up mb-8">
        I&apos;m a software engineer with a passion for building products that
        make a difference.
      </p>

      <WorkExperience
        index={1}
        company="Nuclear Promise X"
        role="Computer Engineer"
        period="2024 July - Present"
        description={
          <>
            <p>
              Currently, I am working on building and designing a new Knowledge
              Hub RAG LLM interface for internal employeess to query their
              companies procedures, standards and data. This is being built in
              <code>typescript</code> and <code>python</code> with the help of
              NextJS, Azure Functions and Azure OpenAI for serverless AI.
            </p>
            <p className="mt-6">
              I also designed, developed and deployed an internal Equipment
              Stats Log for{" "}
              <a
                href="https://www.brucepower.com/"
                className="text-blue-500 hover:underline"
              >
                Bruce Power
              </a>
              . Specifically, a dashboard for tracking the live status of
              components and their sensors accross nuclear facilities. The sole
              purpose was to aid Nuclear Operators in recording and hand off
              intra day component updates. It was designed in Figma, developed
              in <code>c#</code>, <code>html</code>, <code>css</code> and{" "}
              <code>javascript</code> and deployed using Azure DevOps Pipelines
              as well as Azure App Services.
            </p>
            <p className="mt-6">
              Additionally, I worked on our nuclear AI product{" "}
              <a
                href="https://npxai.com"
                className="text-blue-500 hover:underline"
              >
                NPX AI
              </a>{" "}
              building a custom translation feature which is an Azure hosted AI
              translation service trained on nuclear documents to learn specific
              nuclear terminology.
            </p>
          </>
        }
        technologies={[
          { logo: "Next", name: "Next.js" },
          { logo: "Figma", name: "Figma" },
          { logo: "TypeScript", name: "TypeScript" },
          { logo: "Tailwind", name: "Tailwind" },
          { logo: "Prisma", name: "Prisma" },
          { logo: "tRPC", name: "tRPC" },
          { logo: "Azure", name: "Azure" },
          { logo: "Blazor", name: "Blazor" },
          { logo: "Bootstrap", name: "Bootstrap" },
        ]}
      />

      <WorkExperience
        index={2}
        company="Nuclear Promise X"
        role="Computer Engineer"
        period="2024 May - August 2023"
        description={
          <>
            <p>
              I spent the majority of my time building a delivery management
              system which helped organize the allocation of drivers, trucks,
              trailers, nuclear waste and components.
            </p>
            <p className="mt-6">
              I created an interactive calendar in <code>typescript</code> which
              was the main interface to schedule shipments and deliveries with a
              drag and drop interface using{" "}
              <a
                href="https://fullcalendar.io/"
                className="text-blue-500 hover:underline"
              >
                FullCalendar
              </a>
              .
            </p>
            <p className="mt-6">
              In addition, I also made a custom Email service to send
              notifications of new shipments using Azure email services.
            </p>
          </>
        }
        technologies={[
          { logo: "Next", name: "Next.js" },
          { logo: "TypeScript", name: "TypeScript" },
          { logo: "Tailwind", name: "Tailwind" },
          { logo: "Prisma", name: "Prisma" },
          { logo: "Azure", name: "Azure" },
          { logo: "Express", name: "Express" },
        ]}
      />

      <WorkExperience
        index={3}
        company="Royal Bank of Canada Capital Markets"
        role="Quantitative Front End Engineer"
        period="2023 Sep - April 2023"
        description={
          <>
            <p>
              I worked on the Data Fabrication team as an intern helping build
              their internal UI which all of capital markets uses to manage
              their databases. Such as trading systems, risk analysis models all
              the way to logs of miscellaneous services.
            </p>
            <p className="mt-6">
              The majority of my work was spent implementing a feature to
              promote your database from one environment to another. This
              involved working with designers, backend engineers, and even
              business analysts to determine the requirements as well as
              implementing the feature.
            </p>

            <p className="mt-6">
              This feature was a complex one as we needed a responsive UI which
              illustrated clearly all the processes that were occuring in the
              backend such as the promotion of every dataset. This meant having
              live updates streamed to the user and maintaining the state of
              every dataset across different sessions.
            </p>
          </>
        }
        technologies={[
          { logo: "React", name: "React" },
          { logo: "MaterialUI", name: "MaterialUI" },
          { logo: "Redux", name: "Redux" },
          { logo: "Django", name: "Django" },
        ]}
      />

      <WorkExperience
        index={4}
        company="Citigroup"
        role="Front End Engineer"
        period="2022 May - August 2022"
        description={
          <>
            <p>
              I spent my time at Citi working in their Equities divison as an
              intern working on their trading platform.
            </p>
            <p className="mt-6">
              Most of my time was dedicated toward building an intuitive and
              straight forward portal for traders to directly query my teams
              database for trade information.
            </p>
            <p className="mt-6">
              The main purpose of this was to free up developer time whenever a
              trader had questions about the status of trades or was worried
              there were potenial errors not displayed on their platforms.
            </p>
            <p className="mt-6">
              In addition to this I also constructed a few one time scripts to
              help my team clean up our databases of garbage data such as
              duplicates, stale and previously corrected data.
            </p>
            <p className="mt-6">
              On top of this, before the end of my internship I made a recurring
              script that used stored procedures to find any duplicates or
              errors in recent data which would then quarantine the data in a
              new table and send out an email summary to the team.
            </p>
          </>
        }
        technologies={[
          { logo: "React", name: "React" },
          { logo: "MaterialUI", name: "MaterialUI" },
          { logo: "Flask", name: "Flask" },
          { logo: "SQLDeveloper", name: "SQL Developer" },
        ]}
      />

      <WorkExperience
        index={5}
        company="Royal Bank of Canada Capital Markets"
        role="Quantitative Infrastructure Engineer"
        period="2021 May - August 2021"
        description={
          <>
            <p>
              This was my first full time job as a software engineer intern and
              where I actually learned Front End development for the first time.
              Shoutout to my mentor Eamonn who encouraged me despite my absolute
              non existent React knowledge. I can&apos;t thank him enough for
              his support and guidance as I probably would have never learned
              React.
            </p>
            <p className="mt-6">
              My team was the FICC Cash analytics team. Specifically we
              maintained a service which simplified the pricing and risk
              analysis of bonds for other internal teams through an API. (Not
              exactly the most UI friendly team as 85% of the work was backend)
            </p>
            <p className="mt-6">
              I spent half of my time working on performance analysis, which
              lead me to determine our JSON parsing was one of the largest
              drawbacks. Leading me to cut our average execution time to 1/3 of
              the original time.
            </p>
            <p className="mt-6">
              The rest of my time was spent learning React and creating my first
              ever React app! I basically built a global dashboard my team could
              use to query logs across all of our servers whether it be
              development, testing or production. As well as monitoring each
              individual team who utilized our systems and the rates at which
              they consumed.
            </p>
          </>
        }
        technologies={[
          { logo: "Cpp", name: "C++" },
          { logo: "React", name: "React" },
          { logo: "Flask", name: "Flask" },
        ]}
      />
    </div>
  );
};

export default page;
