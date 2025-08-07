import { toast as hotToast } from 'react-hot-toast';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  const message = title && description ? `${title}\n${description}` : title || description || '';
  
  if (variant === 'destructive') {
    hotToast.error(message);
  } else {
    hotToast.success(message);
  }
};

export { toast as useToast };
