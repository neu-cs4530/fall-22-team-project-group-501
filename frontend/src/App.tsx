import { ChakraProvider } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import assert from 'assert';
import React, { useCallback, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import TownController from './classes/TownController';
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
import TownControllerContext from './contexts/TownControllerContext';
import { TownsServiceClient } from './generated/client';
// eslint-disable-next-line no-var

const supUrl = process.env.REACT_APP_TOWNS_SERVICE_URL;
const supKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

function App() {
  const [user, setUser] = useState({});

  const supabase = createClient(
    supUrl ?? '',
    supKey ?? '', // eslint-disable-line no-undef
  );

  function handleCallbackResponse(response: any) {}

  const [townController, setTownController] = useState<TownController | null>(null);
  const [authClient, setAuthClient] = useState<SupabaseClient | null>(null); // eslint-disable-line no-unused-vars

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
  const townsService = new TownsServiceClient({ BASE: url }).towns;
  const authService = supabase;
  return (
    <LoginControllerContext.Provider
      value={{ setTownController, setAuthClient, townsService, supabaseService: authService }}>
      <UnsupportedBrowserWarning>
        <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
          <ErrorDialog dismissError={() => setError(null)} error={error} />
          {page}
        </VideoProvider>
      </UnsupportedBrowserWarning>
    </LoginControllerContext.Provider>
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
