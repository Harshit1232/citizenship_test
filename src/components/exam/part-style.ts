import type { PartId } from "@/lib/types";

const TEXT: Record<PartId, string> = {
  part1: "text-part1",
  part2: "text-part2",
  part3: "text-part3",
  part4: "text-part4",
  glossary: "text-glossary",
};

const BG: Record<PartId, string> = {
  part1: "bg-part1",
  part2: "bg-part2",
  part3: "bg-part3",
  part4: "bg-part4",
  glossary: "bg-glossary",
};

/** Text colour for a booklet part (ochre, ocean, gum, wattle, slate). */
export function partColorClass(part: PartId): string {
  return TEXT[part] ?? "text-glossary";
}

export function partBgClass(part: PartId): string {
  return BG[part] ?? "bg-glossary";
}

export const PART_SHORT: Record<PartId, string> = {
  part1: "Australia and its people",
  part2: "Democratic beliefs, rights and liberties",
  part3: "Government and the law",
  part4: "Australian values",
  glossary: "Glossary",
};
