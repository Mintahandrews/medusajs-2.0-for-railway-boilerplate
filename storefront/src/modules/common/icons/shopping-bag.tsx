import React from "react"

import { IconProps } from "types/icon"

const ShoppingBag: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 9V7a5 5 0 0 1 10 0v2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 9h12l-1.1 11H7.1L6 9Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default ShoppingBag
