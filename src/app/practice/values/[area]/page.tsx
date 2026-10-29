import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PracticeHeader } from "@/components/practice/practice-header";
import { ScenarioPlayerLoader } from "@/components/values/loaders";
import { AREA_BY_ID, VALUES_AREAS, type ValuesAreaId } from "@/data/values-scenarios";

/** One static page per values area; any other value is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return VALUES_AREAS.map((a) => ({ area: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params;
  const meta = AREA_BY_ID.get(area as ValuesAreaId);
  return {
    title: meta ? `${meta.title}: values scenarios` : "Values scenarios",
    description: meta?.summary,
  };
}

export default async function ValuesAreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  if (!AREA_BY_ID.has(area as ValuesAreaId)) notFound();
  return (
    <>
      <PracticeHeader />
      <ScenarioPlayerLoader area={area as ValuesAreaId} />
    </>
  );
}
