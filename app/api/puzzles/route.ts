import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, grid, words } = body;

    if (!title || !grid || !words) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const puzzle = await prisma.puzzle.create({
      data: {
        title,
        size: grid.length,
        grid,
        words,
      },
    });

    return NextResponse.json(puzzle);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const puzzles = await prisma.puzzle.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(puzzles);
}
