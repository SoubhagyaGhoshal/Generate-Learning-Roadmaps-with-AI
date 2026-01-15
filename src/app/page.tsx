import { Suspense } from "react";
import RoadmapHero from "@/components/landing/roadmap-hero";
import RoadmapFooter from "@/components/landing/roadmap-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <RoadmapHero />
      </main>
      <RoadmapFooter />
    </div>
  );
}
