import React from "react"

import { IconProps } from "types/icon"

const Monitor: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => {
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
        x="3.5"
        y="5"
        width="17"
        height="11"
        rx="2"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M9 19h6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 16v3"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Monitor
