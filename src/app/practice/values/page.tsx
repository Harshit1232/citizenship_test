import type { Metadata } from "next";
import { PracticeHeader } from "@/components/practice/practice-header";
import { ValuesHubLoader } from "@/components/values/loaders";

export const metadata: Metadata = {
  title: "Values mastery",
  description:
    "Learn the Australian values questions with 38 short scenarios, one for each rule in Part 4 of Our Common Bond, then prove it at the values gate.",
};

export default function ValuesPage() {
  return (
    <>
      <PracticeHeader />
      <ValuesHubLoader />
    </>
  );
}
