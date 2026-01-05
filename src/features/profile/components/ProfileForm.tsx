import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { profileCreateSchema, type ProfileCreateInput, EDUCATION_LEVELS, STREAMS, genderOptions } from "../schemas/profile.schemas"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Select } from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"
import { ExamSelect } from "./ExamSelect"
import { SyllabusPreview } from "./SyllabusPreview"

interface ProfileFormProps {
  defaultValues?: Partial<ProfileCreateInput>
  onSubmit: (values: ProfileCreateInput) => void
  submitLabel?: string
  isSubmitting?: boolean
  secondaryAction?: () => void
  secondaryLabel?: string
}

export function ProfileForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save",
  isSubmitting,
  secondaryAction,
  secondaryLabel,
}: ProfileFormProps) {
  const preferenceDefaults = {
    language: "en",
    timezone: "Asia/Kolkata",
    theme: "system" as const,
    notification_preferences: { email: true, push: true },
    test_preferences: { practice_reminders: true },
  }

  const baseDefaults: ProfileCreateInput = {
    full_name: "",
    display_name: "",
    date_of_birth: "",
    gender: undefined,
    country: "IN",
    pincode: "",
    education_level: "10th_studying",
    stream: "science_pcm",
    institution: "",
    target_exams: [],
    target_year: new Date().getFullYear() + 1,
    preferences: preferenceDefaults,
  }

  const form = useForm<any>({
    resolver: zodResolver(profileCreateSchema) as any,
    defaultValues: {
      ...baseDefaults,
      ...defaultValues,
      preferences: { ...preferenceDefaults, ...defaultValues?.preferences },
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...baseDefaults,
        ...defaultValues,
        preferences: { ...preferenceDefaults, ...defaultValues.preferences },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues])

  const selectedExams = form.watch("target_exams") || []

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values as ProfileCreateInput))}
        className="space-y-8"
      >
        <Section title="Personal">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="What should we call you?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || undefined)}>
                      <option value="">Select</option>
                      {genderOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.replace(/_/g, " ")}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="IN" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input placeholder="110001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Section title="Education">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="education_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education level</FormLabel>
                  <FormControl>
                    <Select value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level.replace(/_/g, " ")}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stream"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream</FormLabel>
                  <FormControl>
                    <Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || undefined)}>
                      <option value="">Select</option>
                      {STREAMS.map((stream) => (
                        <option key={stream} value={stream}>
                          {stream.replace(/_/g, " ")}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>School / College / Coaching</FormLabel>
                  <FormControl>
                    <Input placeholder="Institute name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Section title="Goals">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="target_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 10}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_exams"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Target exams</FormLabel>
                  <FormControl>
                    <ExamSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SyllabusPreview selectedExamCodes={selectedExams} />
          </div>
        </Section>

        <Section title="Preferences">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="preferences.language"
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
              name="preferences.timezone"
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
            <FormField
              control={form.control}
              name="preferences.theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <Select value={field.value ?? "system"} onChange={(e) => field.onChange(e.target.value)}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3 rounded-lg border bg-white p-4">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <ToggleRow
                label="Email updates"
                checked={!!form.watch("preferences.notification_preferences.email")}
                onCheckedChange={(checked) =>
                  form.setValue("preferences.notification_preferences.email", checked)
                }
              />
              <ToggleRow
                label="Push alerts"
                checked={!!form.watch("preferences.notification_preferences.push")}
                onCheckedChange={(checked) =>
                  form.setValue("preferences.notification_preferences.push", checked)
                }
              />
              <ToggleRow
                label="SMS"
                checked={!!form.watch("preferences.notification_preferences.sms")}
                onCheckedChange={(checked) => form.setValue("preferences.notification_preferences.sms", checked)}
              />
            </div>
            <div className="space-y-3 rounded-lg border bg-white p-4">
              <p className="text-sm font-semibold text-foreground">Test preferences</p>
              <ToggleRow
                label="Practice reminders"
                checked={!!form.watch("preferences.test_preferences.practice_reminders")}
                onCheckedChange={(checked) =>
                  form.setValue("preferences.test_preferences.practice_reminders", checked)
                }
              />
              <ToggleRow
                label="Mock test tips"
                checked={!!form.watch("preferences.test_preferences.mock_test_tips")}
                onCheckedChange={(checked) =>
                  form.setValue("preferences.test_preferences.mock_test_tips", checked)
                }
              />
            </div>
          </div>
        </Section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {secondaryAction ? (
            <Button type="button" variant="outline" onClick={secondaryAction}>
              {secondaryLabel || "Cancel"}
            </Button>
          ) : (
            <div />
          )}
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {children}
    </div>
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
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
