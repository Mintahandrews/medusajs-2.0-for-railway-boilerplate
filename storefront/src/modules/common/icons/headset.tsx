import React from "react"

import { IconProps } from "types/icon"

const Headset: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => {
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
        d="M4 12a8 8 0 0 1 16 0"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4.5 12.5v4.5a2 2 0 0 0 2 2H8v-8H6.5a2 2 0 0 0-2 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 12.5v4.5a2 2 0 0 1-2 2H16v-8h1.5a2 2 0 0 1 2 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 19v2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Headset
