import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { getFriendlyError } from "@/shared/lib/errors"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { AuthCardLayout } from "../components/AuthCardLayout"
import { useLoginMutation } from "../hooks/use-auth"
import { loginSchema, type LoginInput } from "../schemas/auth-schemas"

export function LoginPage() {
  const [formError, setFormError] = useState<string | null>(null)
  const loginMutation = useLoginMutation()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  })

  const onSubmit = (values: LoginInput) => {
    setFormError(null)
    loginMutation.mutate(values, {
      onError: (error) => setFormError(getFriendlyError(error)),
    })
  }

  return (
    <AuthCardLayout
      eyebrow="Welcome back"
      title="Sign in"
      description="Authenticate with your email and password. Device details are captured automatically."
      footer={
        <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">Don't have an account?</span>
          <Link className="font-semibold text-primary" to={APP_ROUTES.register}>
            Create one
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
                    <Link
                      to={APP_ROUTES.forgot}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loginMutation.isPending || !form.formState.isValid}>
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
        <p className="text-xs text-muted-foreground">
          We include your browser and platform in the sign-in request to help secure your sessions.
        </p>
      </PageTransition>
    </AuthCardLayout>
  )
}
