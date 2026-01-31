import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const puzzles = await prisma.puzzle.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(puzzles);
}

export async function POST(req: Request) {
  const body = await req.json();

  const puzzle = await prisma.puzzle.create({
    data: {
      title: body.title,
      size: body.size,
      grid: body.grid,
      words: body.words,
    },
  });

  return NextResponse.json(puzzle);
}
