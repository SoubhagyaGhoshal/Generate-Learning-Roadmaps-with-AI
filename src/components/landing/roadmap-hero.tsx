import DotPattern from "@/components/ui/dot-pattern";
import MarqueeDemo from "@/components/ui/marque-wrapper";
import { cn } from "@/lib/utils";
import { clerkClient } from "@clerk/nextjs";
import { Telescope, Wand, Sparkles, Zap, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { Link as LinkWithViewTransitions } from "next-view-transitions";
import Image from "next/image";
import NeobrutalismButton from "@/components/ui/neobrutalism-button";
import TextTicker from "@/components/marketing/text-ticker";
import { getTotalRoadmapsGenerated } from "@/actions/roadmaps";
import { RoadmapIconCloud } from "./roadmap-icon-cloud";
import { db } from "@/lib/db";

async function RoadmapTicker() {
  const totalRoadmapCount = await getTotalRoadmapsGenerated();
  return <>{totalRoadmapCount} Roadmaps Generated!</>;
}

async function UserAvatars() {
  // Fetch real user count from database
  let userCount = 1000; // Default fallback
  try {
    const count = await db.user.count();
    if (count > 0) {
      userCount = count;
    }
  } catch (error) {
    console.error("Error fetching user count:", error);
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="isolate flex -space-x-3 overflow-hidden">
        <div className="relative z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black border-2 border-white ring-2 ring-black shadow-brutal-sm">
          <span className="text-xs font-bold text-white">AI</span>
        </div>
        <div className="relative z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black border-2 border-white ring-2 ring-black shadow-brutal-sm">
          <span className="text-xs font-bold text-white">ML</span>
        </div>
        <div className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black border-2 border-white ring-2 ring-black shadow-brutal-sm">
          <span className="text-xs font-bold text-white">WEB</span>
        </div>
      </div>
      <div className="text-sm text-black">
        <span className="font-bold">Trusted by {userCount.toLocaleString()}+ learners</span>
      </div>
    </div>
  );
}

export default function RoadmapHero() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          )}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pb-32 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center space-x-2 px-4 py-2 bg-white border-2 border-black rounded-lg shadow-brutal-sm">
            <span className="text-sm font-semibold text-black">AI-Powered Learning Paths</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-black tracking-tight text-black sm:text-7xl lg:text-8xl mb-6">
            Generate Learning
            <br />
            Roadmaps with AI
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg leading-8 text-gray-700 max-w-2xl mx-auto font-medium">
            Transform any topic into a structured, personalized learning journey.
            Create comprehensive roadmaps in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <LinkWithViewTransitions href="/roadmap">
              <button className="brutal-hover inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-white border-2 border-black rounded-lg shadow-brutal-lg">
                <Wand className="w-5 h-5 mr-2" />
                Generate
              </button>
            </LinkWithViewTransitions>

            <LinkWithViewTransitions href="/explore">
              <button className="brutal-hover inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-white border-2 border-black rounded-lg shadow-brutal-lg">
                <Telescope className="w-5 h-5 mr-2" />
                Explore
              </button>
            </LinkWithViewTransitions>
          </div>

          {/* Roadmap Count - Subtle Highlight */}
          <div className="mt-16 flex items-center justify-center">
            <div className="inline-flex items-center">
              <span className="text-lg font-semibold text-gray-700">
                <RoadmapTicker />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="overflow-hidden max-w-screen-xl mx-auto h-64 mb-16">
        <div className="overflow-x-hidden">
          <MarqueeDemo />
        </div>
      </div>
    </div>
  );
}
