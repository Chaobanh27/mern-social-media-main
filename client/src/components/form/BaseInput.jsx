import React from 'react'


const BaseInput = React.forwardRef(
  ({ label, error, className, ...props }, ref) => {
    return (
      <>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={className}
          {...props}
        />

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </>
    )
  }
)

BaseInput.displayName = 'BaseInput'
export default BaseInput
