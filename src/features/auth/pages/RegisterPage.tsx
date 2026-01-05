import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { getFriendlyError } from "@/shared/lib/errors"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { AuthCardLayout } from "../components/AuthCardLayout"
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter"
import { useRegisterMutation } from "../hooks/use-auth"
import { registerSchema, type RegisterInput } from "../schemas/auth-schemas"

export function RegisterPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const registerMutation = useRegisterMutation()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      phone: "" as unknown as RegisterInput["phone"],
      agree_to_terms: false,
    },
    mode: "onChange",
  })

  const passwordValue = form.watch("password")

  const onSubmit = (values: RegisterInput) => {
    setFormError(null)
    registerMutation.mutate(
      { ...values, phone: values.phone ?? null, agree_to_terms: true },
      {
        onSuccess: (data) => {
          toast.success("Account created. Verify your email to continue.")
          navigate(`${APP_ROUTES.verify}?email=${encodeURIComponent(values.email)}`, {
            state: { devToken: data.dev_verification_token, email: values.email },
          })
        },
        onError: (error) => setFormError(getFriendlyError(error)),
      },
    )
  }

  return (
    <AuthCardLayout
      eyebrow="Create account"
      title="Get started"
      description="Set a strong password and confirm your email to activate your account."
      footer={
        <div className="flex items-center justify-between text-sm">
          <span>Already have an account?</span>
          <Link className="font-semibold text-primary" to={APP_ROUTES.login}>
            Sign in
          </Link>
        </div>
      }
    >
      <PageTransition className="space-y-6">
        {formError ? (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        ) : null}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <span className="text-xs text-muted-foreground">Min 8 chars</span>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <PasswordStrengthMeter password={passwordValue} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <span className="text-xs text-muted-foreground">E.164 e.g. +15551234567</span>
                  </div>
                  <FormControl>
                    <Input
                      id="phone"
                      placeholder="+15551234567"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agree_to_terms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3 rounded-lg border px-4 py-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-tight">
                      <FormLabel>I agree to the Terms of Service</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        You must accept to create your account.
                      </p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={registerMutation.isPending || !form.formState.isValid}>
              {registerMutation.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Form>
      </PageTransition>
    </AuthCardLayout>
  )
}
