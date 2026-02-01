import { prisma } from "@/lib/prisma";
import PuzzleClient from "./PuzzleClient";
import { notFound } from "next/navigation";
import { GridState } from "@/lib/types";


export default async function PuzzlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const puzzle = await prisma.puzzle.findUnique({
    where: { id },
  });

  if (!puzzle) {
    notFound();
  }

  const grid = JSON.parse(puzzle.data) as GridState;
  

  return <PuzzleClient initialGrid={grid} title={puzzle.title} id={puzzle.id} />;
}
