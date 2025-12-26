import React from "react"

const Paystack = ({ size = "24", color = "currentColor", ...attributes }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...attributes}
        >
            <path
                d="M2 4H22V6H2V4ZM2 8H22V10H2V8ZM2 12H16V14H2V12ZM2 16H22V18H2V16ZM18 12H22V14H18V12Z"
                fill={color}
            />
        </svg>
    )
}

export default Paystack
