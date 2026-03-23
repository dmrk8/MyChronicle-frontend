import { useEffect, useRef, useState } from "react";

function useSessionState<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (v: T) => string;
    deserialize?: (s: string) => T;
  }
) {
const serializeRef = useRef(options?.serialize ?? JSON.stringify);
  const deserializeRef = useRef(options?.deserialize ?? JSON.parse);

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? deserializeRef.current(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      setValue(raw !== null ? deserializeRef.current(raw) : defaultValue);
    } catch {
      setValue(defaultValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    try {
      sessionStorage.setItem(key, serializeRef.current(value));
    } catch {
      /* ignore storage errors (e.g. private browsing quota) */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default useSessionState;