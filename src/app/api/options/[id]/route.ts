import { NextRequest } from "next/server";
import { fail, ok, parseBody } from "@/lib/api";
import { deleteOption, getOption, updateOption } from "@/lib/repo";
import { optionInputSchema } from "@/lib/types";

async function resolveId(ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return Number(id);
}

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const id = await resolveId(ctx);
  const option = getOption(id);
  if (!option) return fail("未找到该选项", 404);
  return ok({ option });
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const id = await resolveId(ctx);
  const parsed = await parseBody(request, optionInputSchema);
  if ("error" in parsed) return parsed.error;
  const option = updateOption(id, parsed.data);
  if (!option) return fail("未找到该选项", 404);
  return ok({ option });
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const id = await resolveId(ctx);
  if (!deleteOption(id)) return fail("未找到该选项", 404);
  return ok({ success: true });
}
