import { ok } from "@/lib/api";
import { listCategories, listTags } from "@/lib/repo";

export async function GET() {
  return ok({ categories: listCategories(), tags: listTags() });
}
