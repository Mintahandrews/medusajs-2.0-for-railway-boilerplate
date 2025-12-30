import React from "react"

import { IconProps } from "types/icon"

const Watch: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => {
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
        d="M9 5.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1.2H9V5.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <rect
        x="7"
        y="6.7"
        width="10"
        height="12.6"
        rx="4"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M9 18.5v.0c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-1.2H9v1.2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 10v3l2 1"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Watch
