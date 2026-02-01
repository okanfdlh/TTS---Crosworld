import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("API /api/puzzles received body keys:", Object.keys(body));
    
    const { title, gridState } = body;

    if (!title || !gridState) {
      console.error("Missing title or gridState");
      return NextResponse.json(
        { error: "Invalid payload: Missing title or gridState" },
        { status: 400 }
      );
    }

    console.log("Saving puzzle:", title);
    
    // Validate that gridState has expected structure
    if (!gridState.rows || !gridState.cols || !gridState.cells) {
       console.error("Invalid gridState structure");
       return NextResponse.json(
        { error: "Invalid payload: gridState is malformed" },
        { status: 400 }
      );
    }

    const puzzle = await prisma.puzzle.create({
      data: {
        title,
        data: JSON.stringify(gridState),
      },
    });

    console.log("Puzzle saved with ID:", puzzle.id);
    return NextResponse.json(puzzle);
  } catch (err) {
    console.error("Error saving puzzle:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const puzzles = await prisma.puzzle.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(puzzles);
  } catch (err) {
    console.error("Error fetching puzzles:", err);
    return NextResponse.json(
      { error: "Failed to fetch puzzles" },
      { status: 500 }
    );
  }
}
