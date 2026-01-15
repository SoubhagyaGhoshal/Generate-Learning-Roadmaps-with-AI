import NavItems from "@/components/app/nav-items";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { Link } from "next-view-transitions";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MobileDrawer from "@/components/app/mobile-drawer";
import NeobrutalismButton from "@/components/ui/neobrutalism-button";
import ThreeDButton from "../ui/three-d-button";

async function AppBar() {
  return (
    <div className="border-b-2 border-black bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="brutal-hover inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-black bg-white border-2 border-black rounded-lg shadow-brutal">
                RoadmapAI
              </div>
            </Link>
            <NavItems />
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/roadmap">
              <button className="brutal-hover inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-black bg-white border-2 border-black rounded-lg shadow-brutal">
                Generate
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppBar;
