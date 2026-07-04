const VISITOR_ID_KEY = "visitor-id:v1";

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";

  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return "";
  }
}
