import { zodResolver } from "@hookform/resolvers/zod"
import { ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useSearchParams } from "react-router-dom"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { AuthCardLayout } from "../components/AuthCardLayout"
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter"
import { useResetPasswordMutation } from "../hooks/use-auth"
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas/auth-schemas"

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const tokenFromQuery = searchParams.get("token") || ""
  const mutation = useResetPasswordMutation()

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenFromQuery, new_password: "" },
    mode: "onChange",
  })

  const passwordValue = form.watch("new_password")

  const onSubmit = (values: ResetPasswordInput) => {
    mutation.mutate(values)
  }

  return (
    <AuthCardLayout
      eyebrow="Secure access"
      title="Choose a new password"
      description="Use the token from your email and meet the password policy."
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
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>The reset link stays valid for a limited time.</span>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset token</FormLabel>
                  <FormControl>
                    <Input placeholder="Paste token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                  </FormControl>
                  <PasswordStrengthMeter password={passwordValue} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={mutation.isPending || !form.formState.isValid}>
              {mutation.isPending ? "Updating..." : "Reset password"}
            </Button>
          </form>
        </Form>
      </PageTransition>
    </AuthCardLayout>
  )
}
