import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, MailCheck, RefreshCw } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useLocation, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { AuthCardLayout } from "../components/AuthCardLayout"
import { useResendVerificationMutation, useVerifyEmailMutation } from "../hooks/use-auth"
import { verifyEmailSchema, type VerifyEmailInput } from "../schemas/auth-schemas"

export function VerifyEmailPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [devPanelOpen, setDevPanelOpen] = useState(false)
  const devToken = (location.state as { devToken?: string; email?: string } | null)?.devToken
  const knownEmail =
    (location.state as { email?: string } | null)?.email || searchParams.get("email") || ""
  const tokenFromQuery = searchParams.get("token") || ""
  const defaultToken = tokenFromQuery || devToken || ""

  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { token: defaultToken },
    mode: "onChange",
  })

  const verifyMutation = useVerifyEmailMutation()
  const resendMutation = useResendVerificationMutation()

  useEffect(() => {
    if (!tokenFromQuery) return
    form.setValue("token", tokenFromQuery)
    verifyMutation.mutate({ token: tokenFromQuery })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromQuery])

  const onSubmit = (values: VerifyEmailInput) => {
    verifyMutation.mutate(values)
  }

  const onResend = () => {
    if (!knownEmail) {
      toast.error("Provide your email first.")
      return
    }
    resendMutation.mutate({ email: knownEmail })
  }

  const copyDevToken = async () => {
    if (!devToken) return
    await navigator.clipboard.writeText(devToken)
    toast.success("Dev token copied")
  }

  return (
    <AuthCardLayout
      eyebrow="Verify email"
      title="Check your inbox"
      description="Paste the verification token from your email."
      footer={
        <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">Already verified?</span>
          <Link className="font-semibold text-primary" to={APP_ROUTES.login}>
            Sign in
          </Link>
        </div>
      }
    >
      <PageTransition className="space-y-5">
        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 text-foreground">
            <MailCheck className="h-4 w-4 text-primary" />
            <span>We've sent a verification email{knownEmail ? ` to ${knownEmail}` : ""}.</span>
          </div>
          <p>Paste the token below. Resend if you don't see it within a minute.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification token</FormLabel>
                  <FormControl>
                    <Input placeholder="Paste token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" disabled={verifyMutation.isPending || !form.formState.isValid}>
                {verifyMutation.isPending ? "Verifying..." : "Verify email"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={onResend}
                disabled={resendMutation.isPending}
              >
                <RefreshCw className="h-4 w-4" />
                Resend verification
              </Button>
            </div>
          </form>
        </Form>

        {devToken ? (
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Developer shortcut</p>
                <p className="text-xs text-muted-foreground">Only visible in dev responses.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setDevPanelOpen((prev) => !prev)}>
                {devPanelOpen ? "Hide" : "Show"}
              </Button>
            </div>
            {devPanelOpen ? (
              <div className="mt-3 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                <code className="flex-1 truncate">{devToken}</code>
                <Button variant="secondary" size="sm" className="gap-1" onClick={copyDevToken}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </PageTransition>
    </AuthCardLayout>
  )
}
