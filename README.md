# DFTW Messaging Client

The messaging client is designed to hide some of the complexity of sending and receiving messages while also retaining flexibility so students can implement their prototypes.

## Data Model

The data model consists of four types of models [`Account`](Account.html), [`Alias`](Alias.html), [`Message`](Message.html), and [`PrivatePayload`](Account.html). Each model has a unique `id` and a Date for `createdAt` and `updatedAt` which correspond to the time the model was created and last updated respectively.

### Accounts and Aliases

The [Account](Account.html) is used for logging into the messaging client and is associated with an email address. The account is not displayed to other users, it is only used for signing in and managing aliases. An account can be associated with multiple aliases.

An [Alias](Alias.html) can be the sender or recipient of a message. Since each account has access to multiple aliases a user can send or receive messages as multiple aliases. The ability to send or receive messages as multiple aliases enables interesting paradigms such as having a work alias and a personal alias in the same messaging app.

### Messages

A [Message](Message.html) is sent from one Alias to one or more recipient aliases. The message has a sender, recipients, and a payload.

### Payloads

[Aliases](Alias.html) and [Messages](Message.html) have a payload field which can be set by the owner of the Alias and the sender of the Message respectively. The payload contains an arbitrary string. This seems like a limitation but it really is not. Almost any javascript object can be passed as a string using `JSON.parse` and `JSON.stringify`. `JSON.parse` takes a string of json and parses it into an object. `JSON.stringify` takes a javascript object and converts it to a json string. An image message could be sent using a payload such as the following.

```json
{
  "type": "image",
  "url": "https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg"
}
```

The client which receives this message could call `JSON.parse`, check the type of the message and display the URL.

## Getting Started

The interface we expose is the [Client](Client.html). It should be possible to complete the assignment by using the methods on the Client to create, read, update, and delete data. In the starter code the Client is exposed in the `onAccountLoggedIn` method. When in doubt check out the documentation or ask the course staff.

The client exposes three events which will be useful for displaying a live chat. [onDeleteMessage](global.html#event:onDeleteMessage), [onNewMessage](global.html#event:onNewMessage), [onUpdateMessage](global.html#event:onUpdateMessage).

<!-- ### Private Payloads

[PrivatePayloads](PrivatePayload.html) are similar to the public payload on Alias and Message. However [PrivatePayloads] are only accessible by the alias which creates the payload. An Alias can create a PrivatePayload on  -->
