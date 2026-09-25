import { ErrorComponent, Link, useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  console.error(error);

  return (
    <div className="flex flex-col gap-4 px-8 pt-12">
      <ErrorComponent error={error} />
      <div className="flex gap-3 text-sm">
        <button
          type="button"
          onClick={() => {
            void router.invalidate();
          }}
          className="text-accent underline decoration-accent/70 underline-offset-2"
        >
          Try again
        </button>
        <Link
          to="/"
          className="text-accent underline decoration-accent/70 underline-offset-2"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
