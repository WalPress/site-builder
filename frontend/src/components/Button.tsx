import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'custom';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary', // Default variant
  className = '',
  disabled,
  ...props // Spread remaining standard button props
}) => {
  const baseStyles = 'px-4 py-2 h-[48px] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed';

  let variantStyles = '';
  let outerDivStyles = '';
  switch (variant) {
    case 'secondary':
      variantStyles = 'bg-sidebar text-white hover:opacity-80 px-4 py-2 rounded-lg text-sm font-medium transition duration-200';
      break;
    case 'outline':
      variantStyles = `bg-white text-green-600 font-medium py-2 px-6 rounded-lg text-sm w-full h-full`;
      outerDivStyles = "inline-block rounded-lg p-[2px] bg-gradient-to-r from-green-500 to-gray-500 hover:from-green-600 hover:to-gray-600 transition duration-200"
      break;
    case 'danger':
      variantStyles = 'bg-red-100 text-white hover:opacity-40';
      break;
    case 'custom':
      break;
    case 'primary': // Fallthrough for default
    default:
      variantStyles = 'bg-gradient-to-r from-green-500 to-gray-500 hover:from-green-600 hover:to-gray-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200 text-sm';
      break;
  }

  const combinedClassName = `${baseStyles} ${variantStyles} ${className}`.trim();
  const outerDivClassName = `relative z-0 ${outerDivStyles}`.trim();

  return (
    <div className={outerDivClassName}>
      <button
        onClick={onClick}
        className={combinedClassName}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </div>
  );
};

export default Button; 