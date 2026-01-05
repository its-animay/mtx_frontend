import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Send } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { AuthCardLayout } from "../components/AuthCardLayout"
import { useForgotPasswordMutation } from "../hooks/use-auth"
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas/auth-schemas"

export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const mutation = useForgotPasswordMutation()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  })

  const onSubmit = (values: ForgotPasswordInput) => {
    mutation.mutate(values, {
      onSuccess: () => setSubmittedEmail(values.email),
    })
  }

  return (
    <AuthCardLayout
      eyebrow="Reset access"
      title="Forgot password"
      description="We'll email you reset instructions if the account exists."
      footer={
        <div className="flex items-center justify-between text-sm">
          <span>Remembered it?</span>
          <Link className="font-semibold text-primary" to={APP_ROUTES.login}>
            Back to sign in
          </Link>
        </div>
      }
    >
      <PageTransition className="space-y-5">
        {submittedEmail ? (
          <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            If {submittedEmail} is registered, you'll receive reset steps in a moment.
          </div>
        ) : null}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={mutation.isPending || !form.formState.isValid}>
              <Send className="mr-2 h-4 w-4" />
              {mutation.isPending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </Form>
      </PageTransition>
    </AuthCardLayout>
  )
}
