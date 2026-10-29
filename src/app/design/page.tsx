import type { Metadata } from "next";
import { PracticeHeader } from "@/components/practice/practice-header";
import { DesignShowcase } from "@/components/design/showcase";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false },
};

export default function DesignPage() {
  return (
    <>
      <PracticeHeader title="Design system" nav={false} />
      <DesignShowcase />
    </>
  );
}
