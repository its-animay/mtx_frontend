import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Select } from "@/shared/ui/select"

const ranges = ["Last 7 days", "Last 14 days", "Last 30 days", "All time"]

export function TimeFilterBar() {
  const [active, setActive] = useState(ranges[0])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/90 p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {ranges.map((range) => (
          <button
            key={range}
            onClick={() => setActive(range)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              active === range ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted"
            }`}
          >
            {range}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select className="min-w-[160px]">
          <option>All subjects</option>
        </Select>
        <Button variant="default" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          View detailed analysis
        </Button>
      </div>
    </div>
  )
}
