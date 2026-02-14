import { Button, Container, Text } from "@medusajs/ui"
import { getMedusaAdminURL } from "@lib/util/env"
import { cookies } from "next/headers"
import { CheckCircle } from "lucide-react"

const ProductOnboardingCta = async () => {
  const cookieStore = await cookies()
  const isOnboarding = cookieStore.get("_medusa_onboarding")?.value === "true"

  if (!isOnboarding) {
    return null
  }

  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full p-8">
      <div className="flex flex-col gap-y-4 center">
        <Text className="text-ui-fg-base text-xl">
          <span className="inline-flex items-center gap-1"><CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" /> Your demo product was successfully created!</span>
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          You can now continue setting up your store in the admin.
        </Text>
        <a href={getMedusaAdminURL()}>
          <Button className="w-full">Continue setup in admin</Button>
        </a>
      </div>
    </Container>
  )
}

export default ProductOnboardingCta
