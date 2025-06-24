/**
 * Custom hook for managing boolean state with toggle functionality
 * @param initialValue - Initial boolean value
 * @returns [value, toggle, setValue] tuple
 */
import { useState, useCallback } from 'react';

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  
  return [value, toggle, setValue] as const;
}