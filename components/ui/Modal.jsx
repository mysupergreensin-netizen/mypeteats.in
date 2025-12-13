import { useEffect } from 'react';
import { cn } from '../../lib/cn';
import Card from './Card';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className={cn('w-full overflow-y-auto shadow-elevated', sizeClasses[size])}>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-6">
            {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
            {showCloseButton && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        )}
        {children}
      </Card>
    </div>
  );
}

