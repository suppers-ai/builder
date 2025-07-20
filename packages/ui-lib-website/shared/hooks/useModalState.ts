import { useCallback, useState } from "preact/hooks";

export interface ModalState {
  isOpen: boolean;
  data?: any;
}

export interface ModalStateOptions {
  initialOpen?: boolean;
  initialData?: any;
  onOpen?: (data?: any) => void;
  onClose?: () => void;
}

/**
 * Hook for managing modal state with optional data
 */
export function useModalState(options: ModalStateOptions = {}) {
  const { initialOpen = false, initialData = null, onOpen, onClose } = options;

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: initialOpen,
    data: initialData,
  });

  const openModal = useCallback((data?: any) => {
    setModalState({ isOpen: true, data });
    onOpen?.(data);
  }, [onOpen]);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, data: null });
    onClose?.();
  }, [onClose]);

  const toggleModal = useCallback((data?: any) => {
    if (modalState.isOpen) {
      closeModal();
    } else {
      openModal(data);
    }
  }, [modalState.isOpen, openModal, closeModal]);

  const setModalData = useCallback((data: any) => {
    setModalState((prev) => ({ ...prev, data }));
  }, []);

  return {
    isOpen: modalState.isOpen,
    data: modalState.data,
    openModal,
    closeModal,
    toggleModal,
    setModalData,
  };
}

/**
 * Hook for managing multiple modals
 */
export function useMultiModalState() {
  const [modals, setModals] = useState<Record<string, ModalState>>({});

  const openModal = useCallback((modalId: string, data?: any) => {
    setModals((prev) => ({
      ...prev,
      [modalId]: { isOpen: true, data },
    }));
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setModals((prev) => ({
      ...prev,
      [modalId]: { isOpen: false, data: null },
    }));
  }, []);

  const toggleModal = useCallback((modalId: string, data?: any) => {
    setModals((prev) => {
      const currentModal = prev[modalId];
      const isCurrentlyOpen = currentModal?.isOpen || false;

      return {
        ...prev,
        [modalId]: {
          isOpen: !isCurrentlyOpen,
          data: isCurrentlyOpen ? null : data,
        },
      };
    });
  }, []);

  const setModalData = useCallback((modalId: string, data: any) => {
    setModals((prev) => ({
      ...prev,
      [modalId]: { ...prev[modalId], data },
    }));
  }, []);

  const isModalOpen = useCallback((modalId: string) => {
    return modals[modalId]?.isOpen || false;
  }, [modals]);

  const getModalData = useCallback((modalId: string) => {
    return modals[modalId]?.data || null;
  }, [modals]);

  return {
    openModal,
    closeModal,
    toggleModal,
    setModalData,
    isModalOpen,
    getModalData,
  };
}
