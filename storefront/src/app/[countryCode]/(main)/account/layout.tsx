import { getCustomer } from "@lib/data/customer"
import AccountLayout from "@modules/account/templates/account-layout"

export default async function AccountPageLayout({
  children,
  dashboard,
  login,
}: {
  children?: React.ReactNode
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await getCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer ? (children ?? dashboard) : (children ?? login)}
    </AccountLayout>
  )
}
