import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          Already have an account?
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          Sign in for a better experience.
        </Text>
      </div>
      <div>
        <LocalizedClientLink
          href="/account"
          data-testid="sign-in-button"
          className="inline-flex items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base h-10 px-5 text-[14px] font-semibold hover:bg-ui-bg-base-hover transition-colors"
        >
          Sign in
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
