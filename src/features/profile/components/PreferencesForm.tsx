import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { preferencesPatchSchema, type PreferencesPatchInput } from "../schemas/profile.schemas"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Switch } from "@/shared/ui/switch"

interface PreferencesFormProps {
  defaultValues?: Partial<PreferencesPatchInput>
  onSubmit: (values: PreferencesPatchInput) => void
  isSubmitting?: boolean
}

export function PreferencesForm({ defaultValues, onSubmit, isSubmitting }: PreferencesFormProps) {
  const form = useForm<any>({
    resolver: zodResolver(preferencesPatchSchema) as any,
    defaultValues: {
      language: defaultValues?.language || "en",
      timezone: defaultValues?.timezone || "Asia/Kolkata",
      theme: defaultValues?.theme || "system",
      notification_preferences: defaultValues?.notification_preferences || { email: true, push: true },
      test_preferences: defaultValues?.test_preferences || { practice_reminders: true },
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        language: defaultValues.language || "en",
        timezone: defaultValues.timezone || "Asia/Kolkata",
        theme: defaultValues.theme || "system",
        notification_preferences: defaultValues.notification_preferences || { email: true, push: true },
        test_preferences: defaultValues.test_preferences || { practice_reminders: true },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values as PreferencesPatchInput))} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <FormControl>
                  <Input placeholder="en" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Input placeholder="Asia/Kolkata" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border bg-white p-4">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <ToggleRow
              label="Email"
              checked={!!form.watch("notification_preferences.email")}
              onCheckedChange={(checked) => form.setValue("notification_preferences.email", checked)}
            />
            <ToggleRow
              label="Push"
              checked={!!form.watch("notification_preferences.push")}
              onCheckedChange={(checked) => form.setValue("notification_preferences.push", checked)}
            />
            <ToggleRow
              label="SMS"
              checked={!!form.watch("notification_preferences.sms")}
              onCheckedChange={(checked) => form.setValue("notification_preferences.sms", checked)}
            />
          </div>

          <div className="space-y-3 rounded-lg border bg-white p-4">
            <p className="text-sm font-semibold text-foreground">Test preferences</p>
            <ToggleRow
              label="Practice reminders"
              checked={!!form.watch("test_preferences.practice_reminders")}
              onCheckedChange={(checked) => form.setValue("test_preferences.practice_reminders", checked)}
            />
            <ToggleRow
              label="Mock test tips"
              checked={!!form.watch("test_preferences.mock_test_tips")}
              onCheckedChange={(checked) => form.setValue("test_preferences.mock_test_tips", checked)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? "Saving..." : "Save preferences"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
