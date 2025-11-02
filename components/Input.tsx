import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', ...rest }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-gray-300 text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-yellow-500 ${className}`}
        {...rest}
      />
    </div>
  );
};

export default Input;