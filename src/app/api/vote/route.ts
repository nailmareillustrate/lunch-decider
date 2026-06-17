import { NextRequest } from "next/server";
import { ok, parseBody } from "@/lib/api";
import { createVoteSession, listVoteSessions } from "@/lib/repo";
import { voteSessionInputSchema } from "@/lib/types";

export async function GET() {
  return ok({ sessions: listVoteSessions() });
}

export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, voteSessionInputSchema);
  if ("error" in parsed) return parsed.error;
  const session = createVoteSession(parsed.data);
  return ok({ session }, { status: 201 });
}
