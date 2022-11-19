import React, { useState } from "react";

function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContentID, setModalContentID] = useState(-1);
  const [modalComponentToDisplay, setModalComponentToDisplay] =
    useState<JSX.Element>();

  const showModal = (
    modalContentID: number,
    modalContentToDisplay: JSX.Element
  ) => {
    setModalContentID(modalContentID);
    setModalComponentToDisplay(modalContentToDisplay);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen: isOpen,
    modalContentID: modalContentID,
    modalComponentToDisplay: modalComponentToDisplay,
    showModal,
    closeModal,
  };
}

export default useModal;
