import type { Metadata } from "next";
import { PracticeHeader } from "@/components/practice/practice-header";
import { SettingsLoader } from "@/components/practice/loaders";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default function SettingsPage() {
  return (
    <>
      <PracticeHeader />
      <SettingsLoader />
    </>
  );
}
