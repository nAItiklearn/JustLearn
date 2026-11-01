import type { Metadata } from "next";
import { Suspense } from "react";
import { Dashboard } from "@/components/app/Dashboard";

export const metadata: Metadata = {
  title: "Perch — your shelf",
};

export default function AppPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Dashboard />
    </Suspense>
  );
}
