# DFTW Chat Library

Welcome to the chat library documentation.
The chat library is a simple but extensible library for building chat applications.
This page of the documentation will explain some of the core concepts of the chat library to help you get started.
We recommend that you read through this page before building your chat application.
After reading through this page, if you need detailed documentation about a specific class or function, you can find it by clicking on the links in the sidebar or using the documentation search.

## Getting Started

### General architecture

There is one [`Account`](Account.html) object for the currently logged in user.
The users you interact with are represented by [`Identity`](Identity.html) objects.
In most cases, each user only has one identity, but if you need multiple identities per user, the functionality is there.
Each identity includes a handle (username) that is unique.
In most of this API you will be referring to users using their handle, and thus it's unlikely you'll need to do much with `Identity` objects,
but you might find `Identity` objects as values of properties, e.g. [`message.sender`](https://designftw.github.io/chat-lib/Message.html#sender).

Messages are represented by [`Message`](Message.html) objects, which have exactly one sender, and one or more recipients.
Messages are just JSON objects, and can contain anything (e.g. you can add a `text` field for a textual message, or other fields for different metadata).

Each object (message, identity etc) has a unique id, and there are methods to get an object from this textual id (e.g. [`client.getMessageById()`](https://designftw.github.io/chat-lib/Client.html#getMessageById)).

You can attach private data (viewable and editable only by the logged in user) to any of these entities via [`PrivateData`](PrivateData.html).

Nearly all of your interactions with this library will be through the helper class [`Client`](Client.html),
which includes a variety of methods for reading and writing data to the chat client.

### Import the Client Class

First, you will need to load the library into your project by importing the [Client](Client.html) class.

```js
import Client from "https://designftw.github.io/chat-lib/src/Client.js";
```

The start of the documentation for every class exposed by the application (i.e. [Client](Client.html), [Message](Message.html), [Account](Account.html), etc.) contains an example for how to import that class.

### Create an Instance of the Client Class

Next, you can create an instance of the [Client](Client.html) class.
The [Client](Client.html) class is the main entry point for the library.
It is responsible for managing the connection to the chat server, sending and receiving messages, and managing the user's account.

```js
const client = new Client("https://messaging-server.csail.mit.edu");
```

The first parameter to the [Client](Client.html) constructor is the URL of the chat server.
You can learn more about the parameters any constructor or class method accepts by looking at the documentation for that class, for example, the parameters to the client constructor are documented [on the Client's page](Client.html#Client).

### Signup and Login to an account

Now that you have an instance of the client class you can start using the methods on the client to sign up a user and log in.

```js
client.signup("example handle", "example@example.com", "example password");
client.login("example@example.com", "example password");
```

The [signup](Client.html#signup) and [login](Client.html#login) are used to sign up and log into the user's account.
The sign up method accepts three parameters:

- `handle`: Similar to a username. The handle is unique to each user and is used to identify the user when sending and receiving messages.
- `email`: The email address of the user. Used to log into the user's account and is not displayed to other users.
- `password`: The password of the user. Used to log into the user's account.

The [login](Client.html#login) method accepts two parameters, email and password, which are the same as the parameters to the [signup](Client.html#signup) method.

### Sending Messages

Now that you have signed up for an account and logged in, you can start using the client to implement the functionality of your chat application.
For example, you can use the client to send messages.


```js
const message = await client.sendMessage({ to: "another handle", data: { text: "Hello World!" } });
```

The [sendMessage](Client.html#sendMessage) method sends a message to another user.
The method accepts a single parameter, an object with the following properties:

- `from`: The handle of the user sending the message. This is optional and defaults to the handle provided during [signup](Client.html#signup) of the currently logged in user.
- `to`: An array of handles of the users to send the message to. This is required.
- `data`: An object containing the data to send. This is required. The data object can contain any data you want to send but it must be an object. In our example we send an object with a single property, `text`, which is the text of the message. You could also send an object with multiple properties, for example, `{ text: "Hello World!", image: "https://example.com/image.png" }`.

### Loading Messages

Now that we have sent a message, we want to be able to view it on another client.

```js
const messages = await client.getMessages()
```

The [getMessages()](Client.html#getMessages) method loads all messages sent to the user and returns an array of [Message](Message.html) instances.
Lets assume the first message in the array is the message we just sent in the previous example.
We could log the message's text to the console:

```js
console.log(messages[0].data.text); // Hello World!
```

### Listening for Updates

Under the hood, the library uses [Web Sockets](https://en.wikipedia.org/wiki/WebSocket) for realtime communication without the sluggishness of regular HTTP requests.
However, you don't need to understand Web Sockets to build your chat client,
since all of that complexity is handled by the library.

Instead, to receive updates, you listen to events on the `client` object, such as
- [`message`](https://designftw.github.io/chat-lib/global.html#event:message) for new messages
- [`messageupdate`](https://designftw.github.io/chat-lib/global.html#event:messageupdate) for updated messages
- [`messagedeletion`](https://designftw.github.io/chat-lib/global.html#event:messagedeletion) for deleted messages

Then, `evt.detail` will contain relevant data about the message.
