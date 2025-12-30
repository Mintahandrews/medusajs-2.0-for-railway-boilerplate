import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wishlist | Letscase",
}

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Wishlist</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        Your wishlist is empty.
      </p>
    </div>
  )
}
