import { useState } from 'react';
import { cn } from '../../lib/cn';
import Input from './Input';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  onClear,
  debounceMs = 300,
}) {
  const [localValue, setLocalValue] = useState(value || '');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (debounceMs > 0) {
      clearTimeout(handleChange.timeout);
      handleChange.timeout = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    } else {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pr-10"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

