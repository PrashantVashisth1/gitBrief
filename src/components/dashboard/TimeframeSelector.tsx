"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

export function TimeframeSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Get current 'days' from URL or default to 1
  const currentDays = searchParams.get("days") || "1";

  const setTimeframe = (days: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("days", days);
    // This updates the URL without a full page reload
    replace(`${pathname}?${params.toString()}`);
  };

  const options = [
    { label: "Last 24h", value: "1" },
    { label: "Weekend", value: "3" },
    { label: "Last 7 Days", value: "7" },
  ];

  return (
    <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 w-fit">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant="ghost"
          size="sm"
          onClick={() => setTimeframe(opt.value)}
          className={`text-xs px-3 py-1 h-7 transition-all ${
            currentDays === opt.value 
              ? "bg-zinc-800 text-white shadow-sm" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}