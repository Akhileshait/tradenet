import { useEffect } from 'react';

interface ShortcutHandlers {
  onBuy?: () => void;
  onSell?: () => void;
  onCancel?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handlers.onBuy?.();
            break;
          case 's':
            e.preventDefault();
            handlers.onSell?.();
            break;
          case 'x':
            e.preventDefault();
            handlers.onCancel?.();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
}