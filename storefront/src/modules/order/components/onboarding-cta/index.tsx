"use client"

import { resetOnboardingState } from "@lib/data/onboarding"
import { Button, Container, Text } from "@medusajs/ui"
import { CheckCircle } from "lucide-react"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full">
      <div className="flex flex-col gap-y-4 center p-4 md:items-center">
        <Text className="text-ui-fg-base text-xl">
          <span className="inline-flex items-center gap-1"><CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" /> Your test order was successfully created!</span>
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          You can now complete setting up your store in the admin.
        </Text>
        <Button
          className="w-fit"
          size="xlarge"
          onClick={() => resetOnboardingState(orderId)}
        >
          Complete setup in admin
        </Button>
      </div>
    </Container>
  )
}

export default OnboardingCta
