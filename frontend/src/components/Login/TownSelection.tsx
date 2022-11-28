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
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { Session, User as SupabaseUser } from '@supabase/gotrue-js';
import assert from 'assert';
import React, { useCallback, useEffect, useState } from 'react';
import { User as LocalUser } from '../../../../townService/src/api/Model';
import TownController from '../../classes/TownController';
import { Town } from '../../generated/client';
import useLoginController from '../../hooks/useLoginController';
import useSettings from '../../hooks/useSettings';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import SettingsIcon from '../VideoCall/VideoFrontend/icons/SettingsIcon';
import TownSettingsPrejoin from './TownSettingsPrejoin';

export default function TownSelection(): JSX.Element {
  // Contexts
  const toast = useToast();
  const { connect: videoConnect } = useVideoContext();
  const loginController = useLoginController();
  const settings = useSettings();

  // Town states
  const { setTownController, supabaseService } = loginController;
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<Town[]>();

  // User states
  const [user, setUser] = useState<SupabaseUser | undefined>(undefined);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [userName, setUserName] = useState<string>('');
  // Authentication states
  const { usersService, townsService, setToken } = loginController;
  const [signedIn, setSignedIn] = useState(false);
  const [signedInAsGuest, setSignedInAsGuest] = useState(false);
  const [sessionData, setSessionData] = useState<Session | null>(null);

  // Admin settings states
  // TODO: fetch adminTownIDList from db
  const { openModal } = settings;
  const { setEditingTown, getEditingTown } = settings;
  const [foundEditingTown, setFoundEditingTown] = useState<boolean>(false);
  // Todo: set states for admin town list?
  const [currentUserTowns, setCurrentUserTowns] = useState<Town[]>([]);

  /* --------------------- Database Functions -------------------- */
  // get user towns with usersService.getUserTowns, set currentUserTowns and log it
  const getUserTowns = useCallback(async () => {
    if (localUser) {
      const userTowns = await usersService.getUserTowns(localUser.userID);
      setCurrentUserTowns(userTowns);
    }
  }, [localUser, usersService]);

  // Gets current user from UsersService endpoint with userID and sets local state
  const getUser = useCallback(async () => {
    if (user && usersService.httpRequest.config.TOKEN) {
      const currentUser = await usersService.getUserInfo(user.id);
      setLocalUser(currentUser);
    }
  }, [user, usersService]);

  const logUser = useCallback(() => {
    console.log(user);
    console.log(currentUserTowns);
    console.log(currentPublicTowns);
  }, [user, currentUserTowns, currentPublicTowns]);

  /* --------------------- Default TownSelection Functions -------------------- */
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

  const handleCreate = async () => {
    if (!userName || userName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please login first',
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
    // let userTownID = userName;
    try {
      const newTownInfo = await townsService.createTownForUser(userName, {
        friendlyName: newTownName,
        isPubliclyListed: newTownIsPublic,
      });
      await getUserTowns();
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
      //await handleJoin(newTownInfo.townID);
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: 'Not able to connect to Towns Service',
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

  /* --------------------- Authentication Functions -------------------- */
  // Get session data from Supabase
  const getSessionData = useCallback(async () => {
    const session = await supabaseService.auth.getSession();
    setSessionData(session.data.session);
  }, [supabaseService.auth]);

  // Handles the sign in process
  useEffect(() => {
    const session = supabaseService.auth.getSession();
    setSignedIn(!!session);
    getSessionData();
  }, [supabaseService, getSessionData]);

  // Update user state when user logs in
  useEffect(() => {
    if (sessionData) {
      setUser(sessionData.user);
      if (sessionData.user) {
        setUserName(sessionData.user.id);
      }
      setToken(sessionData.access_token);
    }
  }, [sessionData, setToken]);

  useEffect(() => {
    getUser();
  }, [getUser]);
  useEffect(() => {
    getUserTowns();
  }, [getUserTowns]);

  /* ------------------------ Admin Settings Functions ------------------------ */
  // Sets foundEditingTown to false if no editing town is found
  useEffect(() => {
    if (!getEditingTown()) {
      setFoundEditingTown(false);
    }
  }, [getEditingTown]);

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
        setEditingTown(newController);
        setFoundEditingTown(true);
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
              redirectTo={window.location.origin}
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
            {signedIn ? ( // signed in with login provider
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
                setUserName('');
              }}>
              Sign Out
            </Button>
            {/* Log Users */}
            <Button mt='4' data-testid='logUsersButton' onClick={logUser}>
              Log Users
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
                  {currentUserTowns.map(town => (
                    <Tr key={town.townID}>
                      <Td role='cell'>{town.friendlyName}</Td>
                      <Td role='cell'>{town.townID}</Td>
                      <Td role='cell'></Td>
                      <td>
                        <Button
                          onClick={() => handleJoin(town.townID)}
                          disabled={town.currentOccupancy >= town.maximumOccupancy}>
                          Connect
                        </Button>
                      </td>
                      {/* Use ModalProvider to sync useDisclosure state between button and TownSettingsPrejoin */}
                      <td>
                        <CustomButton
                          data-testid='editTownButton'
                          startIcon={<SettingsIcon />}
                          onClick={() => {
                            handleEdit(town.townID);
                            // use context to call openModal from provider
                            openModal();
                          }}></CustomButton>
                      </td>
                      {/* If foundEditingTown is true render TownSettingsPrejoin with editingTownController */}
                      {foundEditingTown ? (
                        // #TODO: figure out best way to destroy modal when done editing town so values don't persist
                        <TownSettingsPrejoin localUser={localUser} />
                      ) : (
                        <></>
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
