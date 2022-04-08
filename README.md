# DFTW Chat Library

Welcome to the chat library documentation.
The chat library is a simple but extensible library for building chat applications.
This page of the documentation will explain some of the core concepts of the chat library to help you get started.
We recommend that you read through this page before building your chat application.
After reading through this page, if you need detailed documentation about a specific class or function, you can find it by clicking on the links in the sidebar or using the documentation search.

## Getting Started

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
const message = await client.sendMessage({ to: ["another handle"], data: { text: "Hello World!" } });
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

The [getMessages](Client.html#getMessages) method loads all messages sent to the user and returns an array of [Message](Message.html) instances.
Lets assume the first message in the array is the message we just sent in the previous example.
We could log the message's text to the console:

```js
console.log(messages[0].data.text); // Hello World!
```

### Listening for Updates

TODO write this

## Data Model

The data model consists of four types of models [`Account`](Account.html), [`Alias`](Alias.html), [`Message`](Message.html), and [`PrivatePayload`](Account.html). Each model has a unique `id` and a Date for `createdAt` and `updatedAt` which correspond to the time the model was created and last updated respectively.

### Accounts and Aliases

The [Account](Account.html) is used for logging into the messaging client and is associated with an email address. The account is not displayed to other users, it is only used for signing in and managing aliases. An account can be associated with multiple aliases.

An [Alias](Alias.html) can be the sender or recipient of a message. Since each account has access to multiple aliases a user can send or receive messages as multiple aliases. The ability to send or receive messages as multiple aliases enables interesting paradigms such as having a work alias and a personal alias in the same messaging app.

### Messages

A [Message](Message.html) is sent from one Alias to one or more recipient aliases. The message has a sender, recipients, and a payload.

### Payloads

[Aliases](Alias.html) and [Messages](Message.html) have a payload field which can be set by the owner of the Alias and the sender of the Message respectively. The payload contains an arbitrary string. This seems like a limitation but it really is not. Almost any javascript object can be converted to a string and from a string using `JSON.parse` and `JSON.stringify`.

`JSON.parse` takes a string of json and parses it into an object. `JSON.stringify` takes a javascript object and converts it to a json string. An image message could be sent using a payload such as the following.

```json
{
  "type": "image",
  "url": "https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg"
}
```

The client which receives this message could call `JSON.parse`, check the type of the message and display the URL.

#### Tips for Using Payloads

For a message the naive way to use a payload is to set the payload to be the text contents of the message. For example Alice can send Bob a message using `client.sendMessage('Alice', ['Bob'], 'foo')` and Alice and Bob get message models which have `{payload: "foo"}` as well as other properties. However if Alice want to add more data to her messages such as an `urgent` flag or an `image url` then sending a string may get complicated. Instead we recommend following the [Open-closed principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle) and sending messages as stringified objects and using properties to identify fields. For example a message containing the text foo and an urgent flag could have a payload `{text: "foo", urgent: True}`. Alice could then send this message to Bob using `client.sendMessage('Alice', ['Bob'], JSON.stringify({text: 'foo', urgent: True}))`.

_You do not need to use alias payloads to implement basic message functionality._

For an alias the payload can be used to provide additional public information. For example the payload could contain an `avatar_url`, a `status` or any number of other fields.

### Private Payloads

_You do not need to use private payloads to implement basic message functionality._

A private payload is similar to a payload on a message or an account but is only visible to the alias which sets the payload. A private payload can be attached by an alias to any message, account, or alias. A private payload is a string which can contain arbitrary JSON.

#### Tips for Using Private Payloads

A private payload attached by an alias to an account can be used to store account specific settings, for example the `theme` of the messenger app.

A private payload attached by an alias to another alias could be used to store a nickname for the alias, or `isFriend` flag.

### Friends

The currently logged in account can access the friends list for any of it's aliases. The friends list is simply a list of aliases that are friends of the passed in alias. Friendship is not bidirectional. If Alice adds Bob to her friend list then Alice's friend list will contain Bob but Bob's friend list does not contain Alice. The friends list does not affect the sending or receiving of messages. The friends list is simply a convenience function which lists known contacts of an alias. You do not need to use the friends list functionality in your client. You could actually implement your own friends list using private payloads.

## Getting Started

The interface we expose is the [Client](Client.html). It should be possible to complete the entire assignment by using the methods on the Client to create, read, update, and delete data.

In the starter code when the user logs in, the function `onAccountLoggedIn` is called with a client which can manage aliases associated with the logged in account.

The first method you will want to call on the client is [`client.getAliasesForAccount()`](Client.html#getAliasesForAccount). This method returns a promise which resolves to an array of all the aliases associated with the logged in account. The documentation contains the return types and argument types for all of the methods on the client so you can access this information yourselves.

Using one of the aliases returned by [`client.getAliasesForAccount()`](Client.html#getAliasesForAccount) you will want to get the messages for the alias using [`client.getMessagesForAlias()`](Client.html#getMessagesForAlias). The documentation shows that this method takes in a string argument `aliasName` and two optional parameters.

> _Why do most of the client methods take an alias name as the first argument?_

> Because the client can be used to manage multiple aliases the methods on the client need an argument to specify which alias is being accessed. If you have a work alias and a personal alias you would get the messages for the work alias by passing the name of the work alias as the first argument. This pattern is repeated throughout the client.

Now that you have a list of messages associated with an alias you may want to group them by unique groups of recipients. We have provided a method in the client which performs this called [groupMessagesByUniqueRecipients](Client.html#groupMessagesByUniqueRecipients). You could alternatively provide your own grouping strategy using properties on the message payloads, or write your own function. This method is just for convenience and prototyping.

How about sending messages? Let's say the logged in client manages an alias named `Alice` and wants to send the alias named `Bob` a message that has the payload `Hello World`. You can call [`client.sendMessage('Alice', ['Bob'], 'Hello World')`](Client.html#sendMessage). The first argument specifies the local alias which is going to send the message, the second argument is a list of recipients, and the third argument is the message payload.

Finally how can you receive messages? The client exposes three events which will be useful for displaying a live updating chat. [messagedelete](global.html#event:messagedelete), [message](global.html#event:message), [messageupdate](global.html#event:messageupdate). If the client wants to update the UI whenever it should display a new message, the client can listen to the `message` event using `client.addEventListener('message', e => console.log(e.detail))` (the console log is just a placeholder!). The event's detail property contains the `messageId` of the new message and the `aliasName` the message should be retrieved for. The client can then get all the information about the new message by calling [`client.getMessageById(aliasName, messageId)`](Client.html#getMessageById).

Hopefully that gives you a head start on implementing basic messaging functionality. When in doubt first check the console to see if an error is being logged, next look at the network tab in the console to see if your requests are failing, finally reach out to course staff.

### PS

We highly encourage you to reach out to each other via slack/piazza or other means and share aliases so that you can message each other while developing the client.

<!-- ### Private Payloads

[PrivatePayloads](PrivatePayload.html) are similar to the public payload on Alias and Message. However [PrivatePayloads] are only accessible by the alias which creates the payload. An Alias can create a PrivatePayload on  -->
