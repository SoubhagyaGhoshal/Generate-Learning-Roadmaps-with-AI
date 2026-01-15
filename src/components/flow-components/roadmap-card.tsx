"use client";
import { deleteRoadmapById, deleteSavedRoadmapById } from "@/actions/roadmaps";
import { EyeIcon } from "@/components/app/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function RoadmapCard({
  author,
  title,
  views,
  timeAgo,
  slug,
  savedRoadmapCard,
  savedRoadmapId,
  imageUrl,
}: {
  author?: string;
  title?: string;
  views?: string;
  timeAgo?: string;
  slug?: string;
  savedRoadmapCard?: boolean;
  savedRoadmapId: string;
  imageUrl?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleDelete = async () => {
    // Prevents the link navigation
    if (!slug) return;

    if (savedRoadmapCard) {
      const res = await deleteSavedRoadmapById(savedRoadmapId);
      if (res.status === "success") {
        toast.success("Deleted", {
          description: "Roadmap deleted successfully ",
          duration: 4000,
        });
        router.refresh();
        return; // Exit the function after deleting saved roadmap
      }
    }

    const response = await deleteRoadmapById(slug);
    if (response.status === "success") {
      toast.success("Deleted", {
        description: "Roadmap deleted successfully ",
        duration: 4000,
      });
      router.refresh();
    } else {
      toast.error("Error", {
        // @ts-ignore
        description: response.message,
        duration: 4000,
      });
    }
  };

  function RoadmapAvatar() {
    return (
      <Avatar className="w-4 h-4 object-cover rounded-full">
        <AvatarImage src={imageUrl} alt={author} />
        <AvatarFallback className="text-xs">
          {author
            ?.split(" ")
            .map((name) => name[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <>
      <div className="brutal-hover flex rounded-lg border-2 border-black bg-white shadow-brutal group relative cursor-pointer">
        <Link href={`/roadmap/${slug}`} className="flex-grow">
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="flex-grow text-base font-bold leading-tight truncate w-[20ch] text-black">
                {title}
              </h2>
            </div>
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-gray-200">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-black">
                <EyeIcon />
                {views}
              </span>

              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                {timeAgo}
              </span>
            </div>
          </div>
        </Link>

        {pathname.includes(`/dashboard`) && (
          <button
            type="button"
            className="group relative m-2 h-4 w-4 rounded-sm hover:bg-gray-200 flex items-center justify-center"
            onClick={handleDelete}
          >
            <span className="sr-only">Remove</span>
            <svg
              viewBox="0 0 14 14"
              className="h-3.5 w-3.5 stroke-black stroke-2"
            >
              <path d="M4 4l6 6m0-6l-6 6" />
            </svg>
            <span className="absolute -inset-1" />
          </button>
        )}
      </div>
    </>
  );
}

export default RoadmapCard;
