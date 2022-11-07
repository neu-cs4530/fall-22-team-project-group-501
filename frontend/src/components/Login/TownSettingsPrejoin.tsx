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
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import TownController from '../../classes/TownController'; // e
import useSettings from '../../hooks/useSettings';

function TownSettingsPrejoin(props: any): JSX.Element {
  // Use the ModalContext to get the modal state and functions
  const settings = useSettings();
  const { isModalOpen, openModal, closeModal } = settings;
  const { getEditingTown, setEditingTown } = settings;

  const editingTown = getEditingTown();

  if (!editingTown) {
    console.log('editingTown is null');
    return <></>;
  }

  const coveyTownController: TownController = editingTown;
  const [friendlyName, setFriendlyName] = useState<string>(coveyTownController.friendlyName);
  const [isPubliclyListed, setIsPubliclyListed] = useState<boolean>(
    coveyTownController.townIsPubliclyListed,
  );
  const [roomUpdatePassword, setRoomUpdatePassword] = useState<string>('');

  const closeSettings = useCallback(() => {
    closeModal();
    setEditingTown(null);
   
    //coveyTownController.unPause();
  }, [settings, coveyTownController]);

  const toast = useToast();
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
      {/* <Button onClick={openSettings}>Settings</Button> */}
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
