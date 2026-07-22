import type { SoundMarkId } from "@/lib/sfx/sounds/visuals";
import { cn } from "@/lib/utils/cn";

/** Compact geometric marks — one silhouette per built-in. */
export function SoundMark({
  mark,
  className,
}: {
  mark: SoundMarkId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-3.5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {markPath(mark)}
    </svg>
  );
}

function markPath(mark: SoundMarkId) {
  switch (mark) {
    case "chime":
      return (
        <>
          <path d="M12 4v2" />
          <path d="M9 8c0 4-2 6-2 9a5 5 0 0 0 10 0c0-3-2-5-2-9" />
          <path d="M10 20h4" />
        </>
      );
    case "sparkle":
      return (
        <>
          <path d="M12 3.5 13.2 9 18.5 12 13.2 15 12 20.5 10.8 15 5.5 12 10.8 9Z" />
          <path d="M18.5 5.5v2.5M19.75 6.75H17.25" />
        </>
      );
    case "droplet":
      return <path d="M12 3.5c0 0 5.5 6.2 5.5 10.2a5.5 5.5 0 1 1-11 0C6.5 9.7 12 3.5 12 3.5Z" />;
    case "bloom":
      return (
        <>
          <circle cx="12" cy="12" r="2.2" />
          <path d="M12 4.5c1.8 2.2 2.8 4.2 2.8 6.2S13.2 14.5 12 14.5 9.2 12.7 9.2 10.7 10.2 6.7 12 4.5Z" />
          <path d="M19.5 12c-2.2 1.8-4.2 2.8-6.2 2.8S9.5 13.2 9.5 12s1.8-2.8 3.8-2.8 4.2 1 6.2 2.8Z" />
          <path d="M12 19.5c-1.8-2.2-2.8-4.2-2.8-6.2S10.8 9.5 12 9.5s2.8 1.8 2.8 3.8-1 4.2-2.8 6.2Z" />
          <path d="M4.5 12c2.2-1.8 4.2-2.8 6.2-2.8S14.5 10.8 14.5 12s-1.8 2.8-3.8 2.8-4.2-1-6.2-2.8Z" />
        </>
      );
    case "whisper":
      return (
        <>
          <path d="M4 9c2.5 0 3.5 2 6 2s3.5-2 6-2 3.5 2 4 2" />
          <path d="M4 13c2.5 0 3.5 2 6 2s3.5-2 6-2 3.5 2 4 2" />
          <path d="M4 17c2.5 0 3.5 2 6 2s3.5-2 6-2 3.5 2 4 2" />
        </>
      );
    case "tick":
      return (
        <>
          <path d="M12 4v10" />
          <circle cx="12" cy="18.5" r="1.5" fill="currentColor" stroke="none" />
        </>
      );
    case "press":
      return (
        <>
          <path d="M12 5v9" />
          <path d="M8.5 11.5 12 15l3.5-3.5" />
          <path d="M7 19h10" />
        </>
      );
    case "release":
      return (
        <>
          <path d="M12 19V10" />
          <path d="M8.5 12.5 12 9l3.5 3.5" />
          <path d="M7 5h10" />
        </>
      );
    case "toggle":
      return (
        <>
          <rect x="4.5" y="8.5" width="15" height="7" rx="3.5" />
          <circle cx="14.5" cy="12" r="2.2" fill="currentColor" stroke="none" />
        </>
      );
    case "success":
      return <path d="M5.5 12.5 10 17l8.5-9" />;
    case "error":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5" />
          <circle cx="12" cy="16.2" r="0.9" fill="currentColor" stroke="none" />
        </>
      );
    case "page":
      return (
        <>
          <path d="M7 4.5h7.5L17.5 8v11.5H7z" />
          <path d="M14.5 4.5V8H17.5" />
          <path d="M9.5 12h5M9.5 15h5" />
        </>
      );
    case "loading":
      return (
        <>
          <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" opacity="0.7" />
          <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" opacity="0.4" />
        </>
      );
    case "ready":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="7.5" />
        </>
      );
    case "draft":
    default:
      return (
        <>
          <path d="M7 4.5h7l3.5 3.5V19.5H7z" />
          <path d="M14 4.5V8h3.5" />
          <path d="M9.5 13h5M9.5 16h3.5" />
        </>
      );
  }
}
