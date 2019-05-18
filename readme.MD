# Dummy Node

The dummy node acts as a `central`, broadcasting messages to connected bluetooth devices. It will send periodic messages to the bluetooth device.

It can also simulate being a websocket client connection to demonstrate pushing messages from the websocket server to a connected bluetooth on another `central`.

#### To run as a **Central**
1. `yarn install`
2. `node index.js`

#### To run as a **Websocket Client**
1. `yarn install`
2. `node example-client.js`

