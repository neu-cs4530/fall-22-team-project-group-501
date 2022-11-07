import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import CustomButton from '@material-ui/core/Button';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'; // eslint-disable-line no-unused-vars
import { Session, User } from '@supabase/gotrue-js'; // eslint-disable-line no-unused-vars
import assert from 'assert';
import React, { useCallback, useEffect, useState } from 'react'; // eslint-disable-line no-unused-vars
import TownController from '../../classes/TownController';
import { Town } from '../../generated/client';
import useLoginController from '../../hooks/useLoginController';
import useSettings from '../../hooks/useSettings';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import SettingsIcon from '../VideoCall/VideoFrontend/icons/SettingsIcon';
import TownSettingsPrejoin from './TownSettingsPrejoin';

export default function TownSelection(): JSX.Element {
  const [userName, setUserName] = useState<string>('');
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<Town[]>();

  const [editingTownController, setEditingTownController] = useState<TownController | null>(null);
  const [foundEditingTown, setFoundEditingTown] = useState<boolean>(false);

  /*   const openSettings = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const closeSettings = useCallback(() => {
    onClose();
  }, [onClose]); */

  const loginController = useLoginController();
  const { setTownController, townsService } = loginController;
  const { setAuthClient, supabaseService } = loginController;
  const { connect: videoConnect } = useVideoContext();

  const settings = useSettings();
  const { isModalOpen, openModal, closeModal } = settings;
  const { setEditingTown, getEditingTown } = settings;

  const [signedIn, setSignedIn] = useState(false);
  const [signedInAsGuest, setSignedInAsGuest] = useState(false);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [user, setUser] = useState<User | undefined>(undefined);

  const adminTownIDList = ['20925346'];
  const [currentUserTowns, setCurrentUserTowns] = useState<Town[]>();

  // Filters the list of towns to only include towns where the townID is in the adminTownIDList
  const filterAdminTowns = useCallback(() => {
    if (currentPublicTowns) {
      const filteredTowns = currentPublicTowns.filter(town =>
        adminTownIDList.includes(town.townID),
      );
      setCurrentUserTowns(filteredTowns);
    }
  }, [currentPublicTowns, adminTownIDList]);

  useEffect(() => {
    const session = supabaseService.auth.getSession();
    setSignedIn(!!session);
    getSessionData();
    console.log('session', sessionData);
    setUser(sessionData?.user);
    console.log('user', user);
    setUserName(user?.id || '');
  }, [supabaseService]);

  // Async function to get session data with format: const { data, error } = await supabase.auth.getSession()
  const getSessionData = async () => {
    const session = await supabaseService.auth.getSession();
    setSessionData(session.data.session);
  };

  // Update user object when session changes
  useEffect(() => {
    if (sessionData) {
      setUser(sessionData.user);
    }
  }, [sessionData]);

  // Update userName once we have a user ID
  useEffect(() => {
    if (user) {
      setUserName(user.id);
    }
  }, [user]);

  const toast = useToast();

  const updateTownListings = useCallback(() => {
    townsService.listTowns().then(towns => {
      setCurrentPublicTowns(towns.sort((a, b) => b.currentOccupancy - a.currentOccupancy));
    });
  }, [setCurrentPublicTowns, townsService]);
  useEffect(() => {
    updateTownListings();
    const timer = setInterval(updateTownListings, 2000);
    return () => {
      clearInterval(timer);
    };
  }, [updateTownListings]);

  const handleJoin = useCallback(
    async (coveyRoomID: string) => {
      try {
        if (!userName || userName.length === 0) {
          toast({
            title: 'Unable to join town',
            description: 'Please select a username',
            status: 'error',
          });
          return;
        }
        if (!coveyRoomID || coveyRoomID.length === 0) {
          toast({
            title: 'Unable to join town',
            description: 'Please enter a town ID',
            status: 'error',
          });
          return;
        }
        const newController = new TownController({
          userName,
          townID: coveyRoomID,
          loginController,
        });
        await newController.connect();
        const videoToken = newController.providerVideoToken;
        assert(videoToken);
        await videoConnect(videoToken);
        setTownController(newController);
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to connect to Towns Service',
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
    },
    [setTownController, userName, toast, videoConnect, loginController],
  );

  // Sets foundEditingTown to false if no editing town is found
  useEffect(() => {
    if (!getEditingTown()) {
      setFoundEditingTown(false);
    }
  }, [getEditingTown]);

  const handleCreate = async () => {
    if (!userName || userName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please select a username before creating a town',
        status: 'error',
      });
      return;
    }
    if (!newTownName || newTownName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please enter a town name',
        status: 'error',
      });
      return;
    }
    try {
      const newTownInfo = await townsService.createTown({
        friendlyName: newTownName,
        isPubliclyListed: newTownIsPublic,
      });
      let privateMessage = <></>;
      if (!newTownIsPublic) {
        privateMessage = (
          <p>
            This town will NOT be publicly listed. To re-enter it, you will need to use this ID:{' '}
            {newTownInfo.townID}
          </p>
        );
      }
      toast({
        title: `Town ${newTownName} is ready to go!`,
        description: (
          <>
            {privateMessage}Please record these values in case you need to change the town:
            <br />
            Town ID: {newTownInfo.townID}
            <br />
            Town Editing Password: {newTownInfo.townUpdatePassword}
          </>
        ),
        status: 'success',
        isClosable: true,
        duration: null,
      });
      await handleJoin(newTownInfo.townID);
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: 'Unable to connect to Towns Service',
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
  };

  // Handle open TownSettings modal for editing town when user clicks on the settings icon for a town in the table
  const handleEdit = useCallback(
    async (townID: string) => {
      try {
        const newController = new TownController({
          userName,
          townID: townID,
          loginController,
        });
        await newController.connect();
        //setEditingTownController(newController);
        setEditingTown(newController);
        //console.log('currentTown', editingTown);
        setFoundEditingTown(true);
        //setDidFindTown(true);
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to connect to Towns Service',
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
    },
    [setEditingTown, userName, toast, loginController],
  );

  return (
    <>
      {!signedIn && !signedInAsGuest ? (
        <Stack>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Login to Create a New Town
            </Heading>
            <Auth
              supabaseClient={supabaseService}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
              socialLayout='horizontal'
              view='sign_in'
              magicLink={true}
              onlyThirdPartyProviders={true}
            />
          </Box>
          <Heading p='4' as='h2' size='lg'>
            -or-
          </Heading>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Continue as Guest
            </Heading>
            <FormControl>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                autoFocus
                name='name'
                placeholder='Your name'
                value={userName}
                onChange={event => setUserName(event.target.value)}
              />
            </FormControl>
            <Button mt='4' data-testid='guestLoginButton' onClick={() => setSignedInAsGuest(true)}>
              Continue
            </Button>
          </Box>
        </Stack>
      ) : (
        // signed in
        <Stack>
          <Box p='4' borderWidth='1px' borderRadius='lg' mb='4'>
            <Heading as='h2' size='lg'>
              Profile Info
            </Heading>

            {/* Shows guest/ login provider status */}
            {signedIn ? ( // signed in
              <div>
                <Heading as='h3' size='sm'>
                  Signed in with Google
                </Heading>
                <Heading as='h3' size='sm'>
                  Email: {user?.email}
                </Heading>
              </div>
            ) : (
              // signed in as guest
              <div>
                <Heading as='h3' size='sm'>
                  Signed in as Guest
                </Heading>
                <Heading as='h3' size='sm'>
                  Username: {userName}
                </Heading>
              </div>
            )}
            <Button
              mt='4'
              data-testid='signOutButton'
              onClick={() => {
                supabaseService.auth.signOut();
                setSignedIn(false);
                setSignedInAsGuest(false);
              }}>
              Sign Out
            </Button>
            <Button data-testid='logUserButton' onClick={() => console.log(user?.id)}>
              Log User
            </Button>
          </Box>
        </Stack>
      )}
      <form>
        {signedIn ? (
          <Stack>
            {/* Table of towns created by users with options to join or delete */}
            <Box borderWidth='1px' borderRadius='lg'>
              <Heading p='4' as='h2' size='lg'>
                Create a New Town
              </Heading>
              <Flex p='4'>
                <Box flex='1'>
                  <FormControl>
                    <FormLabel htmlFor='townName'>New Town Name</FormLabel>
                    <Input
                      name='townName'
                      placeholder='New Town Name'
                      value={newTownName}
                      onChange={event => setNewTownName(event.target.value)}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel htmlFor='isPublic'>Publicly Listed</FormLabel>
                    <Checkbox
                      id='isPublic'
                      name='isPublic'
                      isChecked={newTownIsPublic}
                      onChange={e => {
                        setNewTownIsPublic(e.target.checked);
                      }}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <Button data-testid='newTownButton' onClick={handleCreate}>
                    Create
                  </Button>
                </Box>
              </Flex>
              <Heading p='4' as='h2' size='md'>
                Your Towns
              </Heading>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Town Name</Th>
                    <Th>Town ID</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentPublicTowns
                    ?.filter(town => adminTownIDList.includes(town.townID))
                    .map(town => (
                      <Tr key={town.townID}>
                        <Td role='cell'>{town.friendlyName}</Td>
                        <Td role='cell'>{town.townID}</Td>
                        <Td role='cell'></Td>
                        <Button
                          onClick={() => handleJoin(town.townID)}
                          disabled={town.currentOccupancy >= town.maximumOccupancy}>
                          Connect
                        </Button>
                        {/* Use ModalProvider to sync useDisclosure state between button and TownSettingsPrejoin */}
                        <CustomButton
                          data-testid='editTownButton'
                          startIcon={<SettingsIcon />}
                          onClick={() => {
                            handleEdit(town.townID);
                            // use context to call openModal from provider
                            openModal();
                          }}></CustomButton>
                        {/* If foundEditingTown is true render TownSettingsPrejoin with editingTownController */}
                        {foundEditingTown ? (
                          // Use SettingsModalContext to sync
                          <TownSettingsPrejoin key={town.townID} />
                        ) : (
                          <div> False </div>
                        )}
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </Box>

            <Heading p='4' as='h2' size='lg'>
              -or-
            </Heading>
          </Stack>
        ) : null}
        {signedIn || signedInAsGuest ? (
          <Stack>
            <Box borderWidth='1px' borderRadius='lg'>
              <Heading p='4' as='h2' size='lg'>
                Join an Existing Town
              </Heading>
              <Box borderWidth='1px' borderRadius='lg'>
                <Flex p='4'>
                  <FormControl>
                    <FormLabel htmlFor='townIDToJoin'>Town ID</FormLabel>
                    <Input
                      name='townIDToJoin'
                      placeholder='ID of town to join, or select from list'
                      value={townIDToJoin}
                      onChange={event => setTownIDToJoin(event.target.value)}
                    />
                  </FormControl>
                  <Button data-testid='joinTownByIDButton' onClick={() => handleJoin(townIDToJoin)}>
                    Connect
                  </Button>
                </Flex>
              </Box>

              <Heading p='4' as='h4' size='md'>
                Select a public town to join
              </Heading>
              <Box maxH='500px' overflowY='scroll'>
                <Table>
                  <TableCaption placement='bottom'>Publicly Listed Towns</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Town Name</Th>
                      <Th>Town ID</Th>
                      <Th>Activity</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentPublicTowns?.map(town => (
                      <Tr key={town.townID}>
                        <Td role='cell'>{town.friendlyName}</Td>
                        <Td role='cell'>{town.townID}</Td>
                        <Td role='cell'>
                          {town.currentOccupancy}/{town.maximumOccupancy}
                          <Button
                            onClick={() => handleJoin(town.townID)}
                            disabled={town.currentOccupancy >= town.maximumOccupancy}>
                            Connect
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </Stack>
        ) : null}
      </form>
    </>
  );
}
