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
      <h1 className="pt-12">History</h1>
      <AnimatedName />
      <p className="motion-preset-slide-up mb-8">
        I&apos;m a software engineer with a passion for building products that
        make a difference.
      </p>

      <WorkExperience
        index={0}
        company="Nuclear Promise X"
        role="Computer Engineer"
        period="2024 July - Present"
        description={
          <>
            <p>
              I worked on our nuclear AI product{" "}
              <a
                href="https://npxai.com"
                className="text-blue-500 hover:underline"
              >
                NPX AI
              </a>{" "}
              building a custom translation feature which is an Azure hosted AI
              translation service trained on nuclear documents to learn specific
              nuclear terminology. Built with Next.js, Tailwind, and Azure.
            </p>
            <p className="mt-6">
              I am currently working on a Equipment Stats Log which is a
              dashboard for tracking the live status of components and their
              sensors accross nuclear facilities. Built with C# Blazor,
              Bootstrap, and Azure.
            </p>
          </>
        }
      />

      <WorkExperience
        index={1}
        company="Nuclear Promise X"
        role="Computer Engineer Intern"
        period="2024 May - August 2023"
        description={
          <>
            <p>
              I spent the majoirty of my time building a delivery management
              which helped organize the allocation of drivers, trucks, trailers
              and nuclear waste and components.
            </p>
            <p className="mt-6">
              I created an interactive calendar which was the main interface to
              schedule shipemnts and deliveries with a drag and drop interface
              using{" "}
              <a
                href="https://fullcalendar.io/"
                className="text-blue-500 hover:underline"
              >
                FullCalender
              </a>
              .
            </p>
            <p className="mt-6">
              In addition, I also made a custom Email service to send
              notifications of new shipments using Azure email services.
            </p>
          </>
        }
      />

      {/* Add three more WorkExperience components here */}
    </div>
  );
};

export default page;
