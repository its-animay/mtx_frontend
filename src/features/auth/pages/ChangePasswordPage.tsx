import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, LogOut } from "lucide-react"
import { useForm } from "react-hook-form"

import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter"
import { useChangePasswordMutation } from "../hooks/use-auth"
import { changePasswordSchema, type ChangePasswordInput } from "../schemas/auth-schemas"

export function ChangePasswordPage() {
  const mutation = useChangePasswordMutation()

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      logout_other_devices: false,
    },
    mode: "onChange",
  })

  const passwordValue = form.watch("new_password")

  const onSubmit = (values: ChangePasswordInput) => {
    mutation.mutate(values)
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Security</p>
          <h1 className="text-3xl font-bold text-foreground">Change password</h1>
          <p className="text-muted-foreground">Meet the password policy and optionally sign out other devices.</p>
        </div>
        <Lock className="h-10 w-10 text-primary" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-lg border bg-white p-6 shadow-sm">
          <FormField
            control={form.control}
            name="current_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
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
                  <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                </FormControl>
                <PasswordStrengthMeter password={passwordValue} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logout_other_devices"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3 rounded-lg bg-muted/40 px-4 py-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true)
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="flex items-center gap-2 text-foreground">
                      <LogOut className="h-4 w-4" /> Logout other devices
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Useful if you suspect a compromised session.
                    </p>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={mutation.isPending || !form.formState.isValid}>
            {mutation.isPending ? "Saving..." : "Update password"}
          </Button>
        </form>
      </Form>
    </PageTransition>
  )
}
