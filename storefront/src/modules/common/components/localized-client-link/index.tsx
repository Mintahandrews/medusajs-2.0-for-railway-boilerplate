"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: (e?: React.MouseEvent<HTMLAnchorElement>) => void
  passHref?: true
  [x: string]: any
}) => {
  const params = useParams()

  const countryCode = (() => {
    const value = (params as any)?.countryCode
    if (typeof value === "string") {
      return value
    }
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0]
    }
    return null
  })()

  if (!countryCode) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  if (href === `/${countryCode}` || href.startsWith(`/${countryCode}/`)) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <Link href={`/${countryCode}${href}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
