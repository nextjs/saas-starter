"use client";

import { useState } from "react";
import clsx from "clsx";

export default function Tab() {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <div className="flex justify-center items-center text-center text-base font-semibold bg-foreground rounded-md shadow-sm">
      <div
        className={clsx(
          "rounded-md p-4 py-2",
          tabIndex === 0
            ? "text-foreground bg-gradient-to-r from-[#0bbdb6]/90 to-[#00d179]/90"
            : "cursor-pointer"
        )}
        onClick={() => handleTabChange(0)}
      >
        连续包年(最高节省44%)
      </div>
      <div
        className={clsx(
          "rounded-md p-4 py-2",
          tabIndex === 1
            ? "text-foreground bg-gradient-to-r from-[#0bbdb6]/90 to-[#00d179]/90"
            : "cursor-pointer"
        )}
        onClick={() => handleTabChange(1)}
      >
        连续包月
      </div>
    </div>
  );
}
