import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import assert from 'assert';
import React, { useCallback, useState } from 'react';
import TownController from '../../classes/TownController';
import useSettings from '../../hooks/useSettings';

/*
 * Modified version TownSettings.tsx to be used in the prejoin screen
 * this allows admin to set the town settings without having to join the town
 * uses SettingsModalContext to keep track of the modal state and current town being modified.
 */
function TownSettingsPrejoin(props: any): JSX.Element {
  // Use the ModalContext to get the modal state and functions
  const toast = useToast();
  const settings = useSettings();
  const { isModalOpen, openModal, closeModal } = settings;
  const { getEditingTown, setEditingTown } = settings;

  const editingTown = getEditingTown();

  // Ensure that editingTown is not null
  assert(editingTown !== null);

  const coveyTownController: TownController = editingTown;
  const [friendlyName, setFriendlyName] = useState<string>(coveyTownController.friendlyName);
  const [isPubliclyListed, setIsPubliclyListed] = useState<boolean>(
    coveyTownController.townIsPubliclyListed,
  );
  const [roomUpdatePassword, setRoomUpdatePassword] = useState<string>('');

  const closeSettings = useCallback(() => {
    /* async function updateRoom() {
      try {
        await coveyTownController.disconnect();
      } catch (err) {
        toast({
          title: 'Error',
          description: `Error updating room: ${err}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
    updateRoom(); */
    closeModal();
    // setEditingTown(null);
    coveyTownController.disconnect();
    console.log('disconnecting');
  }, [settings, coveyTownController]);

  const processUpdates = async (action: string) => {
    if (action === 'delete') {
      try {
        await coveyTownController.deleteTown(roomUpdatePassword);
        toast({
          title: 'Town deleted',
          status: 'success',
        });
        closeSettings();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to delete town',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected error, see browser console for details.',
            status: 'error',
          });
        }
      }
    } else {
      try {
        await coveyTownController.updateTown(roomUpdatePassword, {
          isPubliclyListed,
          friendlyName,
        });
        toast({
          title: 'Town updated',
          description: 'To see the updated town, please exit and re-join this town',
          status: 'success',
        });
        closeSettings();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to update town',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected error, see browser console for details.',
            status: 'error',
          });
        }
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen()}
        onClose={() => {
          closeModal();
        }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Edit town {coveyTownController.friendlyName} ({coveyTownController.townID})
          </ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={ev => {
              ev.preventDefault();
              processUpdates('edit');
            }}>
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel htmlFor='friendlyName'>Friendly Name</FormLabel>
                <Input
                  id='friendlyName'
                  placeholder='Friendly Name'
                  name='friendlyName'
                  value={friendlyName}
                  onChange={ev => setFriendlyName(ev.target.value)}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel htmlFor='isPubliclyListed'>Publicly Listed</FormLabel>
                <Checkbox
                  id='isPubliclyListed'
                  name='isPubliclyListed'
                  isChecked={isPubliclyListed}
                  onChange={e => setIsPubliclyListed(e.target.checked)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor='updatePassword'>Town Update Password</FormLabel>
                <Input
                  data-testid='updatePassword'
                  id='updatePassword'
                  placeholder='Password'
                  name='password'
                  type='password'
                  value={roomUpdatePassword}
                  onChange={e => setRoomUpdatePassword(e.target.value)}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                data-testid='deletebutton'
                colorScheme='red'
                mr={3}
                value='delete'
                name='action1'
                onClick={() => processUpdates('delete')}>
                Delete
              </Button>
              <Button
                data-testid='updatebutton'
                colorScheme='blue'
                mr={3}
                value='update'
                name='action2'
                onClick={() => processUpdates('edit')}>
                Update
              </Button>
              <Button onClick={() => closeSettings()}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

export default TownSettingsPrejoin;

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
