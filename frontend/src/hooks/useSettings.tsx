import { useContext } from 'react';
import assert from 'assert';
import LoginControllerContext from '../contexts/LoginControllerContext';
import { LoginController } from '../contexts/LoginControllerContext';
import { SettingsController } from '../contexts/SettingsModalContext';
import SettingsModalContext from '../contexts/SettingsModalContext';

/**
 * Use this hook to access the current LoginController.
 */
export default function useSettings(): SettingsController {
  const ctx = useContext(SettingsModalContext);
  assert(ctx, 'Settings context should be defined.');
  return ctx;
}
