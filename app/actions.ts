"use server";

import { prisma } from "@/lib/prisma";
import { GridState } from "@/lib/types";

export async function savePuzzle(
  title: string,
  gridState: GridState
) {
  if (!title || !gridState) {
    throw new Error("Invalid payload");
  }

  const puzzle = await prisma.puzzle.create({
    data: {
      title,
      data: JSON.stringify(gridState),
    },
  });

  return puzzle.id;
}
