import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, parseBody } from "@/lib/api";
import { decide, recordHistory } from "@/lib/repo";
import { DECISION_MODES, filterSchema } from "@/lib/types";

const bodySchema = z.object({
  filter: filterSchema.optional(),
  mode: z.enum(DECISION_MODES).default("random"),
  record: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, bodySchema);
  if ("error" in parsed) return parsed.error;
  const { mode, record } = parsed.data;
  const filter = parsed.data.filter ?? filterSchema.parse({});
  const option = decide(filter);
  if (!option) return fail("没有符合条件的选项，试试放宽筛选条件", 404);
  if (record) recordHistory(option.id, mode);
  return ok({ option });
}
