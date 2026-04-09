import { useEffect, useState } from "react";

/**
 * Debounce một giá trị — chờ `delay` ms sau lần thay đổi cuối mới cập nhật.
 * Dùng để tránh spam API khi user đang gõ tìm kiếm.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
