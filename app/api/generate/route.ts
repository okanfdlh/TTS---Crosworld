import { generateCrossword } from "@/lib/generator";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const result = generateCrossword(body.words);
  return NextResponse.json(result);
}
