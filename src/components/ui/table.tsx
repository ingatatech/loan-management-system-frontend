import React from 'react';

export const Alert = ({ variant = 'default', children, className = '' }: {
  variant?: 'default' | 'destructive',
  children: React.ReactNode,
  className?: string
}) => {
  const baseClasses = 'p-4 rounded-lg flex items-start gap-2';
  const variantClasses = {
    default: 'bg-blue text-white',
    destructive: 'bg-red text-white'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="font-medium">{children}</h5>
);

export const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

export const Select = ({ value, onChange, children, placeholder }: {
  value: string,
  onChange: (value: string) => void,
  children: React.ReactNode,
  placeholder?: string
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
};

export const SelectItem = ({ value, children }: {
  value: string,
  children: React.ReactNode
}) => (
  <option value={value}>{children}</option>
);

export const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full border-collapse">{children}</table>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

export const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b hover:bg-gray-50">{children}</tr>
);

export const TableHead = ({ children, className = '' }: {
  children: React.ReactNode,
  className?: string
}) => (
  <th className={`px-4 py-2 text-left text-sm font-medium text-gray-500 ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }: {
  children: React.ReactNode,
  className?: string
}) => (
  <td className={`px-4 py-2 ${className}`}>{children}</td>
);

export const Tooltip = ({ children, content }: {
  children: React.ReactNode,
  content: string
}) => {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-10 px-2 py-1 text-sm text-white bg-black rounded bottom-full left-1/2 transform -translate-x-1/2 mb-1">
          {content}
        </div>
      )}
    </div>
  );
};

export const Button = ({
  variant = 'default',
  size = 'default',
  children,
  onClick,
  disabled = false,
  className = ''
}: {
  variant?: 'default' | 'outline' | 'ghost',
  size?: 'default' | 'sm',
  children: React.ReactNode,
  onClick?: () => void,
  disabled?: boolean,
  className?: string
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100'
  };

  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-2 py-1 text-xs'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = ''
}: {
  type?: string,
  placeholder?: string,
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  className?: string
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

export const Card = ({ children, className = '' }: {
  children: React.ReactNode,
  className?: string
}) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: {
  children: React.ReactNode,
  className?: string
}) => (
  <div className={`p-4 border-b ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

export const CardContent = ({ children, className = '' }: {
  children: React.ReactNode,
  className?: string
}) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

// Custom Dialog Components
export const Dialog = ({ isOpen, onClose, children }: {
  isOpen: boolean,
  onClose: () => void,
  children: React.ReactNode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b">
    {children}
  </div>
);

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);

export const DialogContent = ({ children, className = '' }: {
  children: React.ReactNode,
  className?: string
}) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const Checkbox = ({
  checked,
  onChange,
  className = ''
}: {
  checked: boolean,
  onChange: (checked: boolean) => void,
  className?: string
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
  />
);

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    {children}
  </div>
);

export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-block">
    {children}
  </div>
);

export const TooltipContent = ({ children, className = '' }: {
  children: React.ReactNode,
  className?: string
}) => (
  <div className={`absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-md shadow-lg ${className}`}>
    {children}
  </div>
);

// Select Components
export const SelectContent = ({ children, className = '' }: {
  children: React.ReactNode,
  className?: string
}) => (
  <div className={`mt-1 absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg ${className}`}>
    {children}
  </div>
);

export const SelectTrigger = ({ children }: { children: React.ReactNode }) => (
  <button className="w-full flex justify-between items-center px-3 py-2 text-sm border rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
    {children}
  </button>
);

export const SelectValue = ({ children }: { children: React.ReactNode }) => (
  <span className="block truncate">
    {children}
  </span>
);

// Dialog Components
export const DialogTrigger = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-block">
    {children}
  </div>
);



