import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, parseBody } from "@/lib/api";
import { filterOptions } from "@/lib/repo";
import { filterSchema } from "@/lib/types";

const bodySchema = z.object({ filter: filterSchema.optional() });

export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, bodySchema);
  if ("error" in parsed) return parsed.error;
  const filter = parsed.data.filter ?? filterSchema.parse({});
  return ok({ options: filterOptions(filter) });
}
