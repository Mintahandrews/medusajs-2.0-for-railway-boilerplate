import React from "react"

import { IconProps } from "types/icon"

const Heart: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => {
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
        d="M12 21s-7-4.6-9.5-9.1C.8 8.8 2.3 5.7 5.4 5.1c1.8-.4 3.6.4 4.6 1.8 1-1.4 2.8-2.2 4.6-1.8 3.1.6 4.6 3.7 2.9 6.8C19 16.4 12 21 12 21Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Heart
