import type { Metadata } from "next";
import { ExamAppLoader } from "@/components/exam/exam-app-loader";

export const metadata: Metadata = {
  title: "Practice test",
  description: "A free 20-question practice test, timed and marked like the real Australian citizenship test.",
};

export default function PracticeTestPage() {
  return <ExamAppLoader />;
}
