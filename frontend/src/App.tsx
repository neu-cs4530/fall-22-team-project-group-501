import { ChakraProvider } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import assert from 'assert';
import React, { useCallback, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import TownController from './classes/TownController';
import { useModalDisclosure } from './components/Login/TownSettingsPrejoin';
import TownMap from './components/Town/TownMap';
import { ChatProvider } from './components/VideoCall/VideoFrontend/components/ChatProvider';
import ErrorDialog from './components/VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog';
import PreJoinScreens from './components/VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import UnsupportedBrowserWarning from './components/VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from './components/VideoCall/VideoFrontend/components/VideoProvider';
import AppStateProvider, { useAppState } from './components/VideoCall/VideoFrontend/state';
import theme from './components/VideoCall/VideoFrontend/theme';
import useConnectionOptions from './components/VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions';
import VideoOverlay from './components/VideoCall/VideoOverlay/VideoOverlay';
import LoginControllerContext from './contexts/LoginControllerContext';
import SettingsModalContext from './contexts/SettingsModalContext';
import TownControllerContext from './contexts/TownControllerContext';
import { TownsServiceClient } from './generated/client';

const SUP_URL = process.env.REACT_APP_SUPABASE_URL;
const SUP_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

function App() {
  const supabase = createClient(SUP_URL ?? '', SUP_KEY ?? '');

  const [townController, setTownController] = useState<TownController | null>(null);
  const [, setAuthClient] = useState<SupabaseClient | null>(null);

  const settingsContext = useModalDisclosure();

  const { error, setError } = useAppState();
  const connectionOptions = useConnectionOptions();
  const onDisconnect = useCallback(() => {
    townController?.disconnect();
  }, [townController]);

  let page: JSX.Element;
  if (townController) {
    page = (
      <TownControllerContext.Provider value={townController}>
        <ChatProvider>
          <TownMap />
          <VideoOverlay preferredMode='fullwidth' />
        </ChatProvider>
      </TownControllerContext.Provider>
    );
  } else {
    page = <PreJoinScreens />;
  }
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  assert(url);

  // Set up the townsService and usersService clients
  const [townsService, setTownsService] = useState(new TownsServiceClient({ BASE: url }).towns);
  const [usersService, setUsersService] = useState(new TownsServiceClient({ BASE: url }).users);
  const authService = supabase;
  const setToken = useCallback((token: string | undefined) => {
    console.log('AHHH');
    setTownsService(service => {
      service.httpRequest.config.TOKEN = token;
      return service;
    });
    setUsersService(service => {
      service.httpRequest.config.TOKEN = token;
      return service;
    });
  }, []);
  return (
    <SettingsModalContext.Provider value={settingsContext}>
      <LoginControllerContext.Provider
        value={{
          setTownController,
          setAuthClient,
          supabaseService: authService,
          setToken,
          townsService,
          usersService,
        }}>
        <UnsupportedBrowserWarning>
          <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
            <ErrorDialog dismissError={() => setError(null)} error={error} />
            {page}
          </VideoProvider>
        </UnsupportedBrowserWarning>
      </LoginControllerContext.Provider>
    </SettingsModalContext.Provider>
  );
}

export default function AppStateWrapper(): JSX.Element {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <MuiThemeProvider theme={theme}>
          <AppStateProvider>
            <App />
          </AppStateProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}
