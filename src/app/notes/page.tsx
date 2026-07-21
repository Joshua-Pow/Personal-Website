import { SubpageLayout } from "@/components/SubpageLayout";

export const metadata = {
  title: "Notes",
  alternates: {
    canonical: "/notes",
  },
};

const page = () => {
  return (
    <SubpageLayout
      title="Notes"
      intro={<p>A timeline of my thoughts and ideas.</p>}
    />
  );
};

export default page;
