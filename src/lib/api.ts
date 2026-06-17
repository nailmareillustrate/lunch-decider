import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { error: fail("请求体不是合法的 JSON", 400) };
  }
  try {
    return { data: schema.parse(json) };
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues.map((i) => i.message).join("；");
      return { error: fail(msg || "参数校验失败", 422) };
    }
    return { error: fail("参数校验失败", 422) };
  }
}
