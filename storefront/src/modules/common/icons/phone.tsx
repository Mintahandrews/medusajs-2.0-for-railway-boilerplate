import React from "react"

import { IconProps } from "types/icon"

const Phone: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="7"
        y="2.5"
        width="10"
        height="19"
        rx="2"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M10 19h4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Phone
