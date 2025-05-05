import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: React.RefObject<HTMLInputElement | null>;
  label: string;
  // value and onChange are already part of InputHTMLAttributes
  className?: string;
}

const Input: React.FC<InputProps> = ({
  ref,
  label,
  value,
  onChange,
  placeholder,
  className = '',
  id, // Use provided id or generate one
  ...props // Spread remaining standard input props
}) => {
  // Generate a simple id if none is provided, for linking label and input
  const inputId = id || `input-${label.replace(/\s+/g, '').toLowerCase()}`;

  const labelStyles = 'text-sm font-medium text-gray-700 mb-1 block';
  const inputStyles =
    'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const combinedInputClassName = `${inputStyles} ${className}`.trim();

  return (
    <div className="w-full">
      <label htmlFor={inputId} className={labelStyles}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={combinedInputClassName}
        {...props}
      />
    </div>
  );
};

export default Input; 