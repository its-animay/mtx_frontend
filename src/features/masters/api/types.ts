export interface ExamSyllabusItem {
  subject_id: string
  topic_ids?: string[]
}

export interface Exam {
  code: string
  name: string
  syllabus?: ExamSyllabusItem[]
}

export interface Subject {
  id: string
  name: string
}

export interface Topic {
  id: string
  name: string
  subject_id: string
}
