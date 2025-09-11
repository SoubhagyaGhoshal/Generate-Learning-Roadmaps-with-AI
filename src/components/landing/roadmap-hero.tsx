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

async function RoadmapTicker() {
  const totalRoadmapCount = await getTotalRoadmapsGenerated();
  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full border border-purple-200">
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-purple-600 fill-current" />
        <span className="text-lg font-bold text-purple-700 tabular-nums">
          <TextTicker value={totalRoadmapCount} />
        </span>
      </div>
      <span className="text-sm font-medium text-gray-700">Roadmaps Generated!</span>
    </div>
  );
}

function UserAvatars() {
  // Simplified fallback for development - no async calls
  return (
    <div className="flex items-center space-x-3">
      <div className="isolate flex -space-x-3 overflow-hidden">
        <div className="relative z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 ring-3 ring-white shadow-lg">
          <span className="text-xs font-medium text-white">AI</span>
        </div>
        <div className="relative z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 ring-3 ring-white shadow-lg">
          <span className="text-xs font-medium text-white">ML</span>
        </div>
        <div className="relative z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 ring-3 ring-white shadow-lg">
          <span className="text-xs font-medium text-white">DEV</span>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-medium">Trusted by 1000+ learners</span>
      </div>
    </div>
  );
}

export default function RoadmapHero() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          )}
        />
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pb-32 lg:px-8 lg:py-48">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">AI-Powered Learning Paths</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl lg:text-8xl">
            Generate Learning
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Roadmaps
            </span>
            <br />
            with <span className="relative">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">AI</span>
              <Sparkles className="absolute -top-2 -right-8 w-8 h-8 text-purple-500 animate-pulse" />
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="mt-8 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Transform any topic into a structured, personalized learning journey. 
            Our AI analyzes your subject and creates a comprehensive roadmap with 
            modules, resources, and clear progression paths.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <LinkWithViewTransitions href="/roadmap">
              <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 hover:from-purple-700 hover:to-blue-700">
                <Wand className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Generate Roadmap
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </LinkWithViewTransitions>
            
            <LinkWithViewTransitions href="/explore">
              <button className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-2xl shadow-lg hover:shadow-xl hover:border-purple-300 hover:text-purple-700 transform hover:-translate-y-1 transition-all duration-200">
                <Telescope className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore Roadmaps
              </button>
            </LinkWithViewTransitions>
          </div>
          
          {/* Social Proof */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
            <UserAvatars />
            <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
            <RoadmapTicker />
          </div>
          
          {/* Features Preview */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">Advanced AI analyzes your topic and creates structured learning paths</p>
            </div>
            
            <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Generation</h3>
              <p className="text-gray-600 text-sm">Get comprehensive roadmaps in seconds, not hours</p>
            </div>
            
            <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive</h3>
              <p className="text-gray-600 text-sm">Explore and navigate through your learning journey visually</p>
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
