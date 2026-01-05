import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

interface RecentAttempt {
  name: string
  date: string
  score: string
  accuracy: string
  time: string
  status?: "pass" | "fail"
}

interface RecentAttemptsTableProps {
  attempts?: RecentAttempt[]
}

export function RecentAttemptsTable({ attempts = [] }: RecentAttemptsTableProps) {
  const rows =
    attempts.length > 0
      ? attempts
      : [
          { name: "—", date: "—", score: "—", accuracy: "—", time: "—" },
          { name: "—", date: "—", score: "—", accuracy: "—", time: "—" },
        ]

  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Recent attempts</CardTitle>
          <CardDescription>Latest test outcomes</CardDescription>
        </div>
        <button className="text-xs font-medium text-primary">View all</button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr>
              {["Test", "Date", "Score", "Accuracy", "Time"].map((h) => (
                <th key={h} className="py-2 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((attempt, idx) => (
              <tr key={idx} className={attempts.length === 0 ? "text-muted-foreground" : ""}>
                <td className="py-2 font-medium">{attempt.name}</td>
                <td className="py-2">{attempt.date}</td>
                <td className="py-2">{attempt.score}</td>
                <td className="py-2">{attempt.accuracy}</td>
                <td className="py-2">{attempt.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
