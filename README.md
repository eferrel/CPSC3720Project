# Tiger Tix Application

# Link to Demo Video
https://www.youtube.com/watch?v=eO2Tl7fKThY&authuser=0

# Overview
This project is a ticketing system built with React frontend and a service-oriented Node backend. The system gives users a convenient way to book and manage ticketing for various Clemson events. Users can use optional voice input or LLM driven booking in the frontend to search, book an event, etc. The backend will provide services for account creation, authentication, ticket management, and more. Both pieces work together to provide a web based application that is reliable and easy to use.

# Stack
Tiger Tix uses a modern full-stack JavaScript architecture. Reach builds the frontend interface that users can interact with, while Node.js and Express power the backend API and service logic. User and ticker data are stored in SQLite. The system also interates an LLM and voice-recognition API to enable voice-based booking which makes the process more accessible to users.

# Architecture Summary
Frontend/
    Handles UI rendering, voice input, sending requests. Code lives under /src with React entry points such as App.js and index.js with specialized components for voice and LLM integration.
Backend/
 - Client-Service: Manages client-related requests and data, as well as some operations, routing, and logic specific to the client entities.
 - Admin-Service: Handles admin management, operations, models, and controllers.
 - LLM-Driven-Booking: Routes the requests through an LLM system and contains the controllers and models needed for booking through this LLM booking system.
 - User-Authentication: Manages the logic for login, signups, and sessions for users.
 - Shared-db: Central database layer which is shared across devices based in SQLite.
 - Tests: Contains global and administrative test suites.
 - Server.js is a service entrypoint.

Each folder mentioned above contains each of these:
- Controllers handle requests and logic.
- Models handle the database schemda and data logic.
- Routes are used as the API endpoints.

# Setting Up Environment Variables
Tiger Tix uses environment variables to securely store configuration values. Each developer should create their own.
1. In the root directory, create a file named .env
2. Copy required variables: LLM_API_KEY, DATABASE_URL, PORT, HOST, etc.
3. Fill in environment variables.
4. Include "require('dotenv').config();" in the backend entry file to ensure that the project loaded environment variables.
5. Do not commit .env files.

# Running Regression Tests
Project includes automated tests for each backend service, as well as global tests for end-to-end functionality.
1. Install dependencies (in the backend, "npm install")
2. From backend, run "npm test" for full test suite
3. To run service specific tests, cd into that service folder, then "npm test"

# Team Members, Instructor, TA
Team Members - Emma Ferrell, Anna Crawford, Stella Herzberg
- Role includes full development of application, test suites, deployment, and documentation of Tiger Tix.

Instructor - Julian Brinkley
- Role includes specification of assignment requirements, oversight of TAs and their roles, and assistance to student questions.

TA - Atik Enam, Colt Doster
- Role includes grading of submissions, recommendations for improvement, and collaboration with instructor to assist in questions and          concerns.

## Installation and Setup Instructions
In the project directory, you can run:

### `npm start` 
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`
Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## License
MIT License

## Learn More
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
To learn React, check out the [React documentation](https://reactjs.org/).

Making a Progessive Web App: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

Deployment: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

