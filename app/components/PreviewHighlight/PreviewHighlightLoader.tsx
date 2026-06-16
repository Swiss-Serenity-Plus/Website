"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const PreviewHighlight = dynamic(() => import("./PreviewHighlight"), { ssr: false });

export default function PreviewHighlightLoader() {
  return (
    <Suspense>
      <PreviewHighlight />
    </Suspense>
  );
}
