import {useCallback, useState} from "react";

const useLocalStorage = (key, initialValue = null) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : initialValue;
    } catch (error) {
      // Handle error here.
      return initialValue;
    }
  });

  const setLocalStorageValue = useCallback(
    value => {
      setStoredValue(state => {
        const newLocalStorageValue = value instanceof Function ? value(state) : value;
        window.localStorage.setItem(key, JSON.stringify(newLocalStorageValue));
        return newLocalStorageValue;
      });
    },
    [key]
  );

  return [storedValue, setLocalStorageValue];
};

export default useLocalStorage;
