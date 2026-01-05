import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

interface WeakTopic {
  topic_id: string
  topic_name?: string
  subject_id: string
}

interface WeakTopicsPanelProps {
  topics?: WeakTopic[]
}

export function WeakTopicsPanel({ topics = [] }: WeakTopicsPanelProps) {
  const hasTopics = topics.length > 0

  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-1">
        <CardTitle>Weak topics</CardTitle>
        <CardDescription>Focus areas to revisit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasTopics ? (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span
                key={topic.topic_id}
                className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
                title={topic.subject_id}
              >
                {topic.topic_name || topic.topic_id}
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-slate-50 p-3 text-sm text-muted-foreground">
            You’ll see weak topics once tests are attempted.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
