import { NextRequest } from "next/server";
import { ok, parseBody } from "@/lib/api";
import { createOption, listOptions } from "@/lib/repo";
import { optionInputSchema } from "@/lib/types";

export async function GET(request: NextRequest) {
  const includeInactive =
    request.nextUrl.searchParams.get("active") !== "true";
  return ok({ options: listOptions(includeInactive) });
}

export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, optionInputSchema);
  if ("error" in parsed) return parsed.error;
  const option = createOption(parsed.data);
  return ok({ option }, { status: 201 });
}
