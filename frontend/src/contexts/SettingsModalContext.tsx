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
