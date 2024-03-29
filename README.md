# Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life.
Covey.Town was built for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/).
You can view a deployment of the app [here](https://coveytown-group501.netlify.app/).

![Covey.Town Architecture](docs/covey-town-architecture.png)

The figure above depicts the high-level architecture of Covey.Town.
The frontend client (in the `frontend` directory of this repository) uses the [PhaserJS Game Library](https://phaser.io) to create a 2D game interface, using tilemaps and sprites.
The frontend implements video chat using the [Twilio Programmable Video](https://www.twilio.com/docs/video) API, and that aspect of the interface relies heavily on [Twilio's React Starter App](https://github.com/twilio/twilio-video-app-react). Twilio's React Starter App is packaged and reused under the Apache License, 2.0.

A backend service (in the `townService` directory) implements the application logic: tracking which "towns" are available to be joined, and the state of each of those towns.

![OAuth Architecture](docs/oauth-architecture.png)

We are using a 3rd party software to handle the middle handshake of Oauth, which means that the client only has to interact with Supabase and not the backend for authentication. This is mostly straightforward, as Supabase (The 3rd party PaaS) has some nice features to make this easy. However, keeping the information we need available outside of the secured auth database required setting up some triggers to duplicate new/updated rows in the auth table to our own “Users” table.

This design allows us to both completely pass responsibility of security over to trusted 3rd parties, while also allowing us control over the information required by the backend.

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a `.env` file in the `townService` directory, setting the values as follows:

| Config Value            | Description                               |
| ----------------------- | ----------------------------------------- |
| `TWILIO_ACCOUNT_SID`    | Visible on your twilio account dashboard. |
| `TWILIO_API_KEY_SID`    | The SID of the new API key you created.   |
| `TWILIO_API_KEY_SECRET` | The secret for the API key you created.   |
| `TWILIO_API_AUTH_TOKEN` | Visible on your twilio account dashboard. |
| `SUPABASE_KEY`          | Contact a member of the team to get this secret, as it is project dependent |
| `REQUEST_ORIGIN_URL`    | This is the regex of the url of the frontend. Defaults to localhost.|


### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `townService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `townService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the following values. There is an example env file provided

| Config Value            | Description                               |
| ----------------------- | ----------------------------------------- |
| `REACT_APP_SUPABASE_ANON_KEY`    | Same as Backend SUPABASE_KEY. |
| `REACT_APP_SUPABASE_URL`    | The URL of the Supabase Service. Found on the Supabase UI   |
| `REACT_APP_TOWNS_SERVICE_URL` | The URL of the towns service. (http://localhost:8081)   |

### Running the frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.
