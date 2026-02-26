"use client";
import { ImagesBadge } from "@/components/ui/images-badge";

export default function ImagesBadgeDemoTwo() {
  return (
    <div className="flex w-full items-center justify-center">
      <ImagesBadge
        text="Your Notes, Visualized"
        images={[
          "https://assets.aceternity.com/pro/agenforce-2.webp",
          "https://assets.aceternity.com/pro/minimal-3-min.webp",
          "https://assets.aceternity.com/pro/bento-4.png",
        ]}
        bookSize={{ width: 140, height: 170 }}
        teaserImageSize={{ width: 90, height: 65 }}
        hoverImageSize={{ width: 360, height: 260 }}
        hoverTranslateY={-280}
        hoverSpread={110}
      />
    </div>
  );
}
