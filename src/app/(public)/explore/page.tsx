import Search from "@/components/flow-components/Search";
import { Suspense } from "react";

export default function Explore() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-8">
            <h1 className="text-center text-5xl font-black text-black">
              Explore Roadmaps
            </h1>
            <Suspense fallback={<div className="text-center text-gray-600">Loading...</div>}>
              <Search />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
