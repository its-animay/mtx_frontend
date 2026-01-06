import { Link } from "react-router-dom"
import { cn } from "@/shared/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  isCurrent?: boolean
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <span key={`${item.label}-${idx}`} className="flex items-center gap-1">
          {item.href && !item.isCurrent ? (
            <Link to={item.href} className="text-primary hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className={cn(item.isCurrent ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
          )}
          {idx < items.length - 1 ? <span>/</span> : null}
        </span>
      ))}
    </nav>
  )
}
