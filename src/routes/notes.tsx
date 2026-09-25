import { createFileRoute } from "@tanstack/react-router";

import { SubpageLayout } from "@/components/SubpageLayout";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/notes")({
  head: () => buildPageHead({ title: "Notes", path: "/notes" }),
  component: NotesPage,
});

function NotesPage() {
  return (
    <SubpageLayout
      title="Notes"
      intro={<p>A timeline of my thoughts and ideas.</p>}
    />
  );
}
