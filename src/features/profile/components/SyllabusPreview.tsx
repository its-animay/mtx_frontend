import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronRight, ListChecks } from "lucide-react"

import { useExams } from "@/features/masters/hooks/useExams"
import { useSubjects } from "@/features/masters/hooks/useSubjects"
import { useTopics } from "@/features/masters/hooks/useTopics"
import { deriveSyllabus, type DerivedSubjectSyllabus } from "@/features/masters/utils/syllabus"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Skeleton } from "@/shared/ui/skeleton"

interface SyllabusPreviewProps {
  selectedExamCodes: string[]
}

export function SyllabusPreview({ selectedExamCodes }: SyllabusPreviewProps) {
  const { data: exams = [], isLoading: loadingExams } = useExams()
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects()

  const syllabus = useMemo(
    () => deriveSyllabus(selectedExamCodes, exams, subjects),
    [selectedExamCodes, exams, subjects],
  )

  if (!selectedExamCodes.length) return null

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ListChecks className="h-4 w-4 text-primary" />
        <span>Syllabus preview</span>
        <Badge variant="muted">Derived from selected exams</Badge>
      </div>

      {loadingExams || loadingSubjects ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : syllabus.length === 0 ? (
        <p className="text-sm text-muted-foreground">No syllabus available for these exams.</p>
      ) : (
        <div className="space-y-2">
          {syllabus.map((item) => (
            <SubjectSection key={item.subject_id} subject={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubjectSection({ subject }: { subject: DerivedSubjectSyllabus }) {
  const [open, setOpen] = useState(false)
  const { data: topics = [], isLoading } = useTopics(open ? subject.subject_id : undefined)

  const filteredTopics = useMemo(() => {
    if (!subject.topic_ids?.length) return topics
    return topics.filter((topic) => subject.topic_ids.includes(topic.id))
  }, [topics, subject.topic_ids])

  return (
    <div className="rounded-md border px-3 py-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="text-sm font-semibold text-foreground">
            {subject.subject_name || subject.subject_id}
          </span>
        </div>
        <Badge variant="outline">{subject.topic_ids.length} topics</Badge>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex flex-wrap gap-2">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : filteredTopics.length === 0 ? (
                <span className="text-xs text-muted-foreground">Topics will appear here.</span>
              ) : (
                filteredTopics.map((topic) => (
                  <span
                    key={topic.id}
                    className={cn(
                      "rounded-full bg-muted px-3 py-1 text-xs text-foreground",
                    )}
                  >
                    {topic.name}
                  </span>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
