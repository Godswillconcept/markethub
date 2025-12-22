import { useEffect } from 'react';

export function useBodyScrollLock(locked) {
  useEffect(() => {
    const { body } = document;
    if (locked) {
      body.style.overflow = 'hidden';
      return () => {
        body.style.overflow = '';
      };
    }
  }, [locked]);
}

export default useBodyScrollLock;
