import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"

import { profileCreateSchema, type ProfileCreateInput, EDUCATION_LEVELS } from "../schemas/profile.schemas"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { ExamSelect } from "./ExamSelect"
import { cn } from "@/shared/lib/utils"

type StepKey = "full_name" | "education_level" | "stream" | "target_exams" | "target_year"

interface OnboardingStepperFormProps {
  defaultValues?: Partial<ProfileCreateInput>
  onSubmit: (values: ProfileCreateInput) => void
  isSubmitting?: boolean
}

const currentYear = new Date().getFullYear()

export function OnboardingStepperForm({ defaultValues, onSubmit, isSubmitting }: OnboardingStepperFormProps) {
  const baseDefaults: ProfileCreateInput = {
    full_name: "",
    display_name: "",
    date_of_birth: "2000-01-01",
    gender: undefined,
    country: "IN",
    pincode: "000000",
    education_level: "10th_studying",
    stream: "science_pcm",
    institution: "",
    target_exams: [],
    target_year: currentYear + 1,
    preferences: {
      language: "en",
      timezone: "Asia/Kolkata",
      theme: "system",
      notification_preferences: { email: true },
      test_preferences: { practice_reminders: true },
    },
  }

  const form = useForm<ProfileCreateInput>({
    resolver: zodResolver(profileCreateSchema) as any,
    defaultValues: {
      ...baseDefaults,
      ...defaultValues,
    },
    mode: "onChange",
  })

  const [stepIndex, setStepIndex] = useState(0)
  const steps: { key: StepKey; title: string; description: string }[] = useMemo(
    () => [
      { key: "full_name", title: "Your name", description: "What should we call you?" },
      { key: "education_level", title: "Education", description: "Where are you in your journey?" },
      { key: "stream", title: "Stream", description: "Choose your stream" },
      { key: "target_exams", title: "Exams", description: "Pick your target exams" },
      { key: "target_year", title: "Timeline", description: "When do you plan to clear it?" },
    ],
    [],
  )

  useEffect(() => {
    // Keep display_name in sync for the lightweight onboarding.
    const subscription = form.watch((values, { name }) => {
      if (name === "full_name") {
        const fullName = values.full_name || ""
        // Always mirror to keep validity without exposing the field.
        form.setValue("display_name", fullName, { shouldValidate: true, shouldDirty: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const currentStep = steps[stepIndex]
  const progress = ((stepIndex + 1) / steps.length) * 100

  const next = async () => {
    const fieldsToValidate: StepKey[] = [currentStep.key]
    const valid = await form.trigger(fieldsToValidate as any)
    if (!valid) return
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const back = () => setStepIndex((prev) => Math.max(prev - 1, 0))

  const handleSubmit = (values: ProfileCreateInput) => {
    onSubmit({
      ...values,
      display_name: values.display_name || values.full_name,
      preferences: {
        language: values.preferences?.language || "en",
        timezone: values.preferences?.timezone || "Asia/Kolkata",
        theme: values.preferences?.theme || "system",
        notification_preferences: values.preferences?.notification_preferences,
        test_preferences: values.preferences?.test_preferences,
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => handleSubmit(values as ProfileCreateInput))} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Step {stepIndex + 1} of {steps.length}</p>
              <h2 className="text-xl font-semibold text-foreground">{currentStep.title}</h2>
              <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            </div>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.key}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border bg-card/60 p-5 shadow-sm backdrop-blur"
          >
            {currentStep.key === "full_name" && (
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentStep.key === "education_level" && (
              <FormField
                control={form.control}
                name="education_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education level</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {EDUCATION_LEVELS.map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => field.onChange(level)}
                            className={cn(
                              "rounded-lg border px-3 py-3 text-left text-sm capitalize shadow-sm transition hover:border-primary/50",
                              field.value === level
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-muted bg-card",
                            )}
                          >
                            {level.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentStep.key === "stream" && (
              <FormField
                control={form.control}
                name="stream"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {["science_pcm", "science_pcb", "commerce", "arts"].map((stream) => (
                          <button
                            key={stream}
                            type="button"
                            onClick={() => field.onChange(stream)}
                            className={cn(
                              "rounded-lg border px-3 py-3 text-left text-sm capitalize shadow-sm transition hover:border-primary/50",
                              field.value === stream
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-muted bg-card",
                            )}
                          >
                            {stream.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentStep.key === "target_exams" && (
              <FormField
                control={form.control}
                name="target_exams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target exams</FormLabel>
                    <FormControl>
                      <ExamSelect value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentStep.key === "target_year" && (
              <FormField
                control={form.control}
                name="target_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={currentYear}
                        max={currentYear + 10}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={back} disabled={stepIndex === 0}>
            Back
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button type="button" onClick={next} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Finish"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
