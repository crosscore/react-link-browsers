This program is a React application that uses WebSocket to enable real-time communication between the browser and the server, displaying synchronized animations across multiple clients.
The following is a description of the system specifications.


1. Server-side (within the websocket-server folder)

1.1. index.js
- Sets up the WebSocket server and waits for client connections.
- When a client connects, generates a unique clientId and saves the client's screen size information.
- Processes messages from clients, handling operations such as changing the circle radius, font size, and starting or stopping player movement.
- At regular intervals, updates the positions of circles and strings, and sends player positions.

1.2. circleMotion.js
- Manages the creation, movement, and deletion of circles.
- The setCircleRadius function allows changing the radius of circles.
- The generateCircles function generates new circles at regular intervals.
- The updateCircles function updates the positions of circles.
- The sendCirclePositions function sends the position information of circles within the display range to each client.

1.3. stringMotion.js
- Manages the creation, movement, and deletion of strings.
- The setFontSize function allows changing the font size.
- The generateCharactors function generates new characters at regular intervals.
- The updateCharactorPositions function updates the positions of characters.
- The sendCharactorPositions function sends the position information of characters within the display range to each client.

1.4. playerMotion.js
- Manages the initialization, movement, and position sending of the player.
- The initializePlayerPosition function sets the initial position of the player.
- The startUpdatingPlayerPosition function starts the player's movement.
- The stopUpdatingPlayerPosition function stops the player's movement.
- The sendPlayerPositions function sends the player's position information to each client.

1.5. utils.js
- Provides functions to calculate the total width and maximum width from the screen sizes of multiple clients.


2. Client-side (src/App.tsx)

2.1. WebSocket connection
- When the component mounts, it connects to the WebSocket server.
- After connecting, it sends the client's screen size information to the server.
- Receives messages from the server and updates the position information of circles, strings, and the player.

2.2. Toggling display of circles and strings
- The "Circles" and "Strings" buttons toggle the display of circles and strings.

2.3. Changing font size and circle radius
- The "Font +" and "Font -" buttons change the font size.
- The "Circle +" and "Circle -" buttons change the circle radius.
- Changes to font size and circle radius are sent to the server.

2.4. Toggling player display and movement
- The "Show Player" and "Hide Player" buttons toggle the display of the player.
- The "W", "A", "S", and "D" keys on the keyboard move the player.
- Information about starting and stopping player movement is sent to the server.

2.5. Screen resizing
- When the screen is resized, the new screen size information is sent to the server.


The overall flow is as follows: the client connects to the WebSocket server and sends screen size information.
The server calculates the positions of circles, strings, and the player based on the received screen size information and sends them to each client.
The client displays the circles, strings, and player based on the received position information.
When the user performs operations using buttons or the keyboard, that information is sent to the server, and the server performs the necessary processing.