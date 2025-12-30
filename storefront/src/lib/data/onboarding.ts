"use server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getMedusaAdminURL } from "@lib/util/env"

export async function resetOnboardingState(orderId: string) {
  const cookieStore = await cookies()
  cookieStore.set("_medusa_onboarding", "false", { maxAge: -1 })
  redirect(getMedusaAdminURL())
}
