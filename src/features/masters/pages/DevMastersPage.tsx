import { PageTransition } from "@/shared/components/PageTransition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Skeleton } from "@/shared/ui/skeleton"
import { useExams } from "../hooks/useExams"
import { useSubjects } from "../hooks/useSubjects"

export function DevMastersPage() {
  const { data: exams = [], isLoading: loadingExams } = useExams()
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects()

  return (
    <PageTransition className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Masters (Dev)</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exams</CardTitle>
            <CardDescription>/exams?active_only=true</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingExams ? (
              <Skeleton className="h-4 w-1/2" />
            ) : (
              <p className="text-sm text-muted-foreground">{exams.length} exams loaded.</p>
            )}
            <div className="max-h-48 space-y-1 overflow-y-auto text-sm">
              {exams.map((exam) => (
                <div key={exam.code} className="rounded-md border px-2 py-1">
                  <p className="font-semibold">{exam.name}</p>
                  <p className="text-xs text-muted-foreground">{exam.code}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>/subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingSubjects ? (
              <Skeleton className="h-4 w-1/2" />
            ) : (
              <p className="text-sm text-muted-foreground">{subjects.length} subjects loaded.</p>
            )}
            <div className="max-h-48 space-y-1 overflow-y-auto text-sm">
              {subjects.map((subject) => (
                <div key={subject.id} className="rounded-md border px-2 py-1">
                  <p className="font-semibold">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">{subject.id}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
