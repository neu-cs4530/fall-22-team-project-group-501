import { useDisclosure } from '@chakra-ui/hooks';
import React from 'react';
import TownController from '../classes/TownController';

/**
 * Type to control setting modal disclosure states 
 * 
 * @typedef {Object} SettingsModalController
 * @property {function} openModal - opens the modal
 * @property {function} closeModal - closes the modal
 * @property {function} isModalOpen - returns true if modal is open
 * 

 * 
 * */
export type SettingsController = {
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: () => boolean;

  setEditingTown: (newController: TownController | null) => void;
  getEditingTown: () => TownController | null;
};

const context = React.createContext<SettingsController | null>(null);
export default context;

// Provider hook that creates modal object and handles state
export function useModalDisclosure() {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const editingTown = React.useRef<TownController | null>(null);
  const didFindTown = React.useRef<boolean>(false);

  const setDidFindTown = (setFound: boolean) => {
    didFindTown.current = setFound;
    console.log('didFindTown', didFindTown.current);
  };

  const isModalOpen = () => {
    return isOpen;
  };
  const closeModal = () => {
    onClose();
    return onClose;
  };
  const openModal = () => {
    onOpen();
    return onOpen;
  };

  const setEditingTown = (newController: TownController | null) => {
    editingTown.current = newController;
  };

  const getEditingTown = () => {
    return editingTown.current;
  };

  return {
    openModal,
    closeModal,
    isModalOpen,
    setEditingTown,
    getEditingTown,
  };
}
