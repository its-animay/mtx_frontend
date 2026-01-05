import { type Exam, type Subject } from "../api/types"

export interface DerivedSubjectSyllabus {
  subject_id: string
  subject_name?: string
  topic_ids: string[]
}

export function deriveSyllabus(
  selectedExamCodes: string[],
  exams: Exam[] = [],
  subjects: Subject[] = [],
): DerivedSubjectSyllabus[] {
  const subjectMap = new Map<string, Set<string>>()

  exams
    .filter((exam) => selectedExamCodes.includes(exam.code))
    .forEach((exam) => {
      exam.syllabus?.forEach((item) => {
        if (!subjectMap.has(item.subject_id)) {
          subjectMap.set(item.subject_id, new Set<string>())
        }
        const set = subjectMap.get(item.subject_id)
        item.topic_ids?.forEach((id) => set?.add(id))
      })
    })

  return Array.from(subjectMap.entries()).map(([subject_id, topicIds]) => {
    const subjectName = subjects.find((s) => s.id === subject_id)?.name
    return {
      subject_id,
      subject_name: subjectName,
      topic_ids: Array.from(topicIds),
    }
  })
}
