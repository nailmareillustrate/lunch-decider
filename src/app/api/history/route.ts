import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, parseBody } from "@/lib/api";
import {
  clearHistory,
  listHistory,
  recordHistory,
  topPicks,
} from "@/lib/repo";
import { DECISION_MODES } from "@/lib/types";

export async function GET() {
  return ok({ history: listHistory(), topPicks: topPicks(6) });
}

const recordSchema = z.object({
  optionId: z.number().int(),
  mode: z.enum(DECISION_MODES).default("manual"),
  note: z.string().trim().max(280).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, recordSchema);
  if ("error" in parsed) return parsed.error;
  const { optionId, mode, note } = parsed.data;
  recordHistory(optionId, mode, note);
  return ok({ success: true }, { status: 201 });
}

export async function DELETE() {
  clearHistory();
  return ok({ success: true });
}
