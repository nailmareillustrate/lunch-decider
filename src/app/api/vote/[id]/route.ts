import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, parseBody } from "@/lib/api";
import { castVote, closeVoteSession, getVoteSession } from "@/lib/repo";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = getVoteSession(id);
  if (!session) return fail("投票不存在", 404);
  return ok({ session });
}

const voteSchema = z.object({
  candidateId: z.number().int(),
  voter: z.string().trim().min(1).max(64),
});

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const parsed = await parseBody(request, voteSchema);
  if ("error" in parsed) return parsed.error;
  const result = castVote(id, parsed.data.candidateId, parsed.data.voter);
  if (!result.ok) return fail(result.error, 400);
  return ok({ session: result.session });
}

export async function PATCH(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = closeVoteSession(id);
  if (!session) return fail("投票不存在", 404);
  return ok({ session });
}
