import { SharedPowName } from "@/components/SharedPowName";

export function SiteHeader() {
  return (
    <h1 className="mb-8 w-full self-start pt-6 font-medium sm:pt-12">
      <SharedPowName variant="header" />
    </h1>
  );
}
