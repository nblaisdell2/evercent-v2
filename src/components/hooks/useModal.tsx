import React, { useState } from "react";

function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const showModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen: isOpen,
    showModal,
    closeModal,
  };
}

export default useModal;
