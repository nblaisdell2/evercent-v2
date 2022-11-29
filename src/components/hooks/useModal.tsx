import React, { useState } from "react";

function useModal(showingModal = (newShow: boolean) => {}) {
  const [isOpen, setIsOpen] = useState(false);

  const showModal = () => {
    if (showingModal) showingModal(true);
    setIsOpen(true);
  };

  const closeModal = () => {
    if (showingModal) showingModal(false);
    setIsOpen(false);
  };

  return {
    isOpen: isOpen,
    showModal,
    closeModal,
  };
}

export default useModal;
