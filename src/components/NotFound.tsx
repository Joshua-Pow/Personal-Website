import { SubpageLayout } from "@/components/SubpageLayout";

export function NotFound() {
  return (
    <SubpageLayout title="Not found" intro={<p>This page does not exist.</p>} />
  );
}
