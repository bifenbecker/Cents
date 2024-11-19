const { useState, useCallback } = require("react");

export const useToggle = (defaultState = false) => {
  const [isOpen, setIsOpen] = useState(defaultState);

  const toggle = useCallback(() => {
    setIsOpen((state) => !state);
  }, []);

  return {
    isOpen,
    setIsOpen,
    toggle,
  };
};
