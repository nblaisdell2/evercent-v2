import React, { useState } from "react";

function useModal() {
  const ModalType = {
    CHANGE_BUDGET: 0,
    USER_DETAILS: 1,
    RESET_REGULAR_EXPENSES: 2,
    CANCEL_AUTOMATION: 3,
    ALL_CATEGORIES_LIST: 4,
    BUDGET_HELPER: 5,
    BUDGET_AUTOMATION: 6,
    REGULAR_EXPENSES: 7,
    UPCOMING_EXPENSES: 8,
  };

  type ModalProps = {
    open: boolean;
    modalContentID: number;
    modalComponentToDisplay: JSX.Element | undefined;
    onClose: () => void;
  };

  const [isOpen, setIsOpen] = useState(false);
  // const [modalContentID, setModalContentID] = useState(-1);
  // const [modalComponentToDisplay, setModalComponentToDisplay] =
  // useState<JSX.Element>();
  const [modalProps, setModalProps] = useState<ModalProps>({
    open: false,
    modalContentID: -1,
    modalComponentToDisplay: undefined,
    onClose: () => setIsOpen(false),
  });

  const showModal = (
    modalContentID: number,
    modalContentToDisplay: JSX.Element
  ) => {
    setModalProps({
      open: true,
      modalContentID: modalContentID,
      modalComponentToDisplay: modalContentToDisplay,
      onClose: () => setIsOpen(false),
    });
    // setModalContentID(modalContentID);
    // setModalComponentToDisplay(modalContentToDisplay);
    // setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    showModal,
    closeModal,
    ModalType,
    isOpen: isOpen,
    modalProps: modalProps,
  };
}

export default useModal;
