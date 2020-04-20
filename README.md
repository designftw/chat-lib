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

The interface we expose is the [Client](Client.html). It should be possible to complete the assignment by using the methods on the Client to create, read, update, and delete data.

The client exposes three events which will be useful for displaying a live chat. [onDeleteMessage](global.html#event:onDeleteMessage), [onNewMessage](global.html#event:onNewMessage), [onUpdateMessage](global.html#event:onUpdateMessage).

In the starter code the Client is exposed in the `onAccountLoggedIn` method. When in doubt check out the documentation or ask the course staff.

<!-- ### Private Payloads

[PrivatePayloads](PrivatePayload.html) are similar to the public payload on Alias and Message. However [PrivatePayloads] are only accessible by the alias which creates the payload. An Alias can create a PrivatePayload on  -->
