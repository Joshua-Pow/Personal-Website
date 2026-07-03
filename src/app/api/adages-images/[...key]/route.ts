import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAllowedAdageImageKey } from "@/lib/adages-images";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

  if (!isAllowedAdageImageKey(objectKey)) {
    return new Response("Not found", { status: 404 });
  }

  const { env } = getCloudflareContext();
  const object = await env.ADAGES_IMAGES.get(objectKey);

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType ?? "image/webp",
  );
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
