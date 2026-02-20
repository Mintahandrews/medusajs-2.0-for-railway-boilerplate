import { getCustomer } from "@lib/data/customer"
import AccountLayout from "@modules/account/templates/account-layout"
import PostHogIdentifyUser from "@lib/posthog/identify-user"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await getCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      <PostHogIdentifyUser customer={customer} />
      {customer ? dashboard : login}
    </AccountLayout>
  )
}
