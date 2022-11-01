import { Box, Heading, Stack } from '@chakra-ui/react';
import React from 'react';

export default function TownSelection(): JSX.Element {
  return (
    <>
      <form>
        <Stack>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Login Below To Create a New Town
            </Heading>
          </Box>
        </Stack>
      </form>
    </>
  );
}
