import Account from "./models/Account.js";
import Identity from "./models/Identity.js";
import Message from "./models/Message.js";
import PrivateData from "./models/PrivateData.js";

import WebSocketEndpoint from "./endpoints/WebSocketEndpoint.js";
import AuthEndpoint from "./endpoints/AuthEndpoint.js";
import IdentitiesEndpoint from "./endpoints/IdentitiesEndpoint.js";
import MessagesEndpoint from "./endpoints/MessagesEndpoint.js";
import PrivateDataEndpoint from "./endpoints/PrivateDataEndpoint.js";
import FriendsEndpoint from "./endpoints/FriendsEndpoint.js";

import { toArray, intersection } from "./util.js";

/**
 * autherror: detail is {message, handle}
 */

/**
 * Object passed to details on CustomEvents about messages fired by the Client.
 * @typedef {object} messageEventDetails
 * @property {string} messageId the id of the message the event is referring to
 * @property {string} handle the handle the event is associated with.
 */

/**
 * Delete Message Event. Called when a message is deleted.
 *
 * When a message is deleted it no longer exists on the server so you cannot call
 * [getMessageById]{@link Client#getMessageById} to get information about a deleted message.
 * @event messagedelete
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and handle name of the message which was deleted.
 */

/**
 * Update Message Event
 *
 * Called when a message is updated. For example if the payload changes. Use
 * [getMessageById]{@link Client#getMessageById} to get information about the updatedMessage such as the
 * new payload.
 * @event messageupdate
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and handle name of the message which was updated.
 */

/**
 * New Message Event
 *
 * Called when a new message is available. Call [getMessageById]{@link Client#getMessageById} to get
 * information about the new message.
 * @event message
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and handle name of the message which was created.
 */

/**
 * ```js
 * import Client from "https://designftw.github.io/chat-lib/src/Client.js";
 * ```
 *
 * The Client is the interface for interacting with the ChatServer.
 *
 *
 * @fires messagedelete
 * @fires messageupdate
 * @fires message
 */
export default class Client extends EventTarget {
  /**
   * The host of the chat server. Includes the hostname and port.
   * @type {string}
   */
  #host;

  /**
  * Helper class for authorization routes.
  * @type {AuthEndpoint}
  */
  #auth;

  /**
  * Helper class for handle routes.
  * @type {IdentitiesEndpoint}
  */
  #identities;

  /**
  * Helper class for message routes.
  * @type {MessagesEndpoint}
  */
  #messages;

  /**
  * Helper class for private payload routes.
  * @type {PrivateDataEndpoint}
  */
  #privateData;

  /**
  * Helper class for friends routes.
  * @type {FriendsEndpoint}
  */
  #friends;

  /**
   * Helper class for web socket routes.
   * @type {WebSocketEndpoint}
   */
  #webSocket;

  /**
   * Client constructor.
   * @param {string} host see [Client's host property]{@link Client#host}
   */
  constructor(host) {
    super();

    this.#host = host;
    this.#auth = new AuthEndpoint(this);
    this.#identities = new IdentitiesEndpoint(this);
    this.#messages = new MessagesEndpoint(this);
    this.#privateData = new PrivateDataEndpoint(this);
    this.#friends = new FriendsEndpoint(this);
    this.#webSocket = new WebSocketEndpoint(this);

    /**
    * The logged in client account. Set in [login]{@link Client#login} and
    * unset in [logout]{@link Client#logout}.
    * @type {Account | undefined}
    */
    this.account = undefined;

    // Redirect all events from private objects to the Client object
    for (let event of ["message", "messageupdate", "messagedelete", "autherror"]) {
      this.#webSocket.addEventListener(event, evt => this.dispatchEvent(evt));
    }
  }

  /**
   * The host of the chat server. Includes the hostname and port.
   * For example https://mozilla.org:4000.
   * Read-only.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/URL/host
   * @type {string}
   */
  get host() {
    return this.#host;
  }

  /**
   * Sign up for a new account with a single initial handle.
   * @param {string} handle The name of the initial handle if signup is successful.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<{message: string}>} A validation message
   */
  signup(handle, email, password) {
    return this.#auth.signup(handle, email, password);
  }

  /**
   * Login to an existing account.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<Account>} Upon success returns the account which was logged in.
   */
  async login(email, password) {
    this.account = await this.#auth.login(email, password);
    this.subscribe(this.account.handle);
    this.dispatchEvent(new CustomEvent("login", { detail: { account: this.account } }));
    return this.account;
  }

  /**
   * Logout of an existing account
   */
  async logout() {
    await this.#auth.logout();
    this.unsubscribe(this.account.handle);
    this.account = undefined;
    this.dispatchEvent(new CustomEvent("logout"));
    return;
  }

  /**
   * Check if the user is currently logged in
   */
  isLoggedIn() {
    return this.#auth.isLoggedIn();
  }

  /**
   * Get an array of all messages that match the provided filters (see below).
   * Note that regardless of the filters provided, only messages the currently logged in account has access to will be returned.
   *
   * @param {Object} options
   * @param {string | Identity | (string | Identity)[]} [options.from] Sender(s) of the messages, either as handle(s) or Identity object(s)
   * @param {string | Identity | (string | Identity)[]} [options.to] Recipient(s) of the messages, either as handle(s) or Identity object(s)
   * @param {Date} [options.since] an optional date to limit the request by. only receive messages since this date.
   * @returns {Promise<Message[]>} a list of messages which pass the filters.
   */
  async getMessages({ from = [], to = [], since } = {}) {
    // Normalize senders and recipients to arrays of handles
    from = toArray(from).map(sender => sender instanceof Identity? sender.handle : sender);
    to = toArray(to).map(recipient => recipient instanceof Identity? recipient.handle : recipient);

    let messages = await this.#messages.getMessagesForAlias(this.account.handle, [...from, ...to], since);

    // Filter messages to only those that match the provided filters
    messages = messages.filter(message => {
      if (from.length > 0) {
        // Filtering by sender(s)
        return from.includes(message.sender.handle);
      }

      if (to.length > 0) {
        // Filtering by recipient(s)
        let recipients = message.recipients.map(recipient => recipient.handle);
        return intersection(recipients, to).length > 0;
      }

      return true;
    });

    return messages;
  }

  /**
   * Get a message object for a message id or
   * Get a message which has the passed in messageId, and was sent or received by the passed in handle.
   *
   * Note the currently logged in account must own the handle associated with the handle.
   * @param messageId The id of the message to get.
   * @param {Object} options
   * @param {string} [options.handle] the handle which sent or received the message, as an optional safeguard against race conditions.
   * @returns {Promise<Message>} The model of the message with the associated id.
   */
  getMessageById(messageId, { handle = this.account.handle } = {}) {
    return this.#messages.getMessage(handle, messageId);
  }

  /**
   * Send a message from the passed in handle to the passed in recipients with the passed in payload.
   *
   * Note the currently logged in account must own the handle associated with the handle.
   * @param {Object} options
   * @param {string | Identity} options.from the sender, either a handle or Identity object
   * @param {string[]} options.to a list of recipients or of the message.
   * @param {Object} options.data the payload associated with the message.
   * @returns {Promise<Message>} The model of the sent message.
   */
  sendMessage({from = this.account.handle, to, data}) {
    from = from instanceof Identity? from.handle : from;
    return this.#messages.sendMessage(from, to, data);
  }

  /**
   * Update a message with the passed in message id which was sent by the passed in handle.
   * @param {Message | string} message Message object or message id
   * @param {Object} options
   * @param {string} [options.handle] the handle which sent the message.
   * @param {Object} options.data the updated data associated with the message
   * @returns {Promise<Message>} The Message object of the updated message.
   */
  updateMessage(message, {handle = this.account.handle, data}) {
    let id = message instanceof Message? message.id : message;
    return this.#messages.updateMessage(handle, id, data);
  }

  /**
   * Delete a message with the passed in messageId which was sent by the passed in handle.
   * @param {Message | string} message Message object or message id
   * @param {Object} [options]
   * @param {string} [options.handle] the handle which sent the message.
   * @returns {Promise<any>} a validation message.
   */
  deleteMessage(message, {handle = this.account.handle} = {}) {
    let id = message instanceof Message? message.id : message;
    return this.#messages.deleteMessage(handle, id);
  }

  /**
   * Get all the handles for the currently logged in account.
   * @returns {Promise<Identity[]>} An array of Alias models.
   */
  async getIdentities() {
    return this.#identities.getAliasesForAccount();
  }

  /**
   * Get an identity by its handle.
   * If an Identity object is passed in, it will just be returned.
   * This way this function can be used to normalize a handle | Identity object into an Identity object.
   *
   * @param {string | Identity} handle the handle to get
   * @returns {Promise<Identity>} The Alias model associated with the passed in name
   */
  async getIdentity(handle) {
    if (handle instanceof Identity) {
      return handle;
    }

    return this.#identities.getAlias(handle);
  }

  /**
   * Create a new identity with the passed in handle and payload.
   * @param {Object} options
   * @param {string} options.handle the name of the new handle
   * @param {Object} [options.data] the data to associate with the handle
   * @returns {Promise<Identity>} The Identity object that corresponds to the new handle
   */
  createIdentity({handle, data}) {
    return this.#identities.createAlias(handle, data);
  }

  /**
   * Update an existing identity.
   * @param {string} handle the handle to update.
   * @param {Object} updates object containing the updates to the handle.
   * @param {string} [updates.handle] the optional new name for the handle
   * @param {Object} [updates.data] the optional new payload for the handle
   * @returns {Promise<Identity>} The Identity object that was updated
   */
  updateIdentity(handle, { handle: newHandle, data: newData } = {}) {
    return this.#identities.updateAlias(handle, {newName: newHandle, newData});
  }

  /**
   * Delete the identity associated with the passed in handle name.
   * @param {string} handle the handle to delete.
   * @returns {Promise<any>} A validation message.
   */
  deleteIdentity(handle) {
    return this.#identities.deleteAlias(handle);
  }

  /**
   * Create a new private payload for the passed in entity, private to the passed in handle.
   * @param {Object} options
   * @param {string} options.handle the handle which is creating the payload.
   * @param {string} options.entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload is attached to.
   * @param {Object} options.data the payload to attach to the entity associated with the passed in entityId, private to the handle associated with the passed in handle.
   * @returns {Promise<PrivateData>} the new private payload.
   */
  createPrivateData({handle, entityId, data}) {
    handle = handle ?? this.account.handle;
    return this.#privateData.createPayload(handle, entityId, data);
  }

  /**
   * Get the private payload associated with the passed in handle and entity.
   * @param {Object} options
   * @param {string} options.handle the handle associated with the payload to get.
   * @param {string} options.entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload to get is attached to.
   * @returns {Promise<PrivateData>} the private payload associated with the passed in handle and entity.
   */
  getPrivateData({handle, entityId}) {
    handle = handle ?? this.account.handle;
    return this.#privateData.getPayload(handle, entityId);
  }

  /**
   * Update the private payload associated with the passed in handle and entity.
   * @param {Object} options
   * @param {string} options.handle the handle associated with the payload to update.
   * @param {string} options.entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload to update is attached to.
   * @param {Object} options.newData the new private payload.
   * @returns {Promise<PrivateData>} the updated private payload.
   */
  updatePrivateData({handle = this.account.handle, entityId, newData}) {
    return this.#privateData.updatePayload(handle, entityId, newData);
  }

  /**
   * Delete the private payload associated with the passed in handle and entity.
   * @param {Object} options
   * @param {string} options.handle the handle associated with the payload to delete.
   * @param {string} options.entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload to delete is attached to.
   * @returns {Promise<any>} A validation message.
   */
  deletePrivateData({handle = this.account.handle, entityId}) {
    return this.#privateData.deletePayload(handle, entityId);
  }

  /**
   * Get all the friends of the passed in handle.
   * @param {string} handle the handle whose friends will be retrieved.
   * @returns {Promise<Identity[]>} an array of handles. These are the passed in handle's friends.
   */
  getFriends(handle = this.account.handle) {
    return this.#friends.getFriendsForAlias(handle);
  }

  /**
   * Add a new friend to the friend list of the passed in handle.
   * @param {string} friendHandle the handle which is going to be added to ownAlias's friend list.
   * @param {Object} options
   * @param {string} [options.ownHandle] the handle adding a friend.
   * @returns {Promise<any>} a validation message.
   */
  addFriend(friendHandle, {ownHandle} = {}) {
    ownHandle = ownHandle ?? this.account.handle;
    return this.#friends.addFriend(ownHandle, friendHandle);
  }

  /**
   * Remove a friend from the friend list of the passed in handle.
   * @param {string} friendHandle the handle which is going to be removed from ownAlias's friend list.
   * @param {Object} options
   * @param {string} [options.ownHandle] the handle removing a friend.
   * @returns {Promise<any>} a validation message.
   */
  removeFriend(friendHandle, {ownHandle} = {}) {
    ownHandle = ownHandle ?? this.account.handle;
    return this.#friends.removeFriend(ownHandle, friendHandle);
  }

  /**
   * Given an array of Messages group the messages by unique groups of sender
   * and recipient handles. For example if Alice sends Bob a message and Bob
   * sends Alice a message both of those messages are in the same group since
   * the set of sender and recipient handles contains {Alice, Bob} for each
   * message.
   *
   * @param {Message[]} messages the messages to group by unique groups of senders and recipients.
   * @returns {Message[][]} an array where each element is a set of messages with a unique set of senders and recipients.
   */
  groupMessagesByUniqueRecipients(messages) {
    const msgKeyedByInterlocutorSets = messages.reduce(
      (
        r,
        v,
        i,
        a,
        k = [...new Set([v.sender.id, ...v.recipients.map((c) => c.id)])]
          .sort()
          .join("")
      ) => ((r[k] || (r[k] = [])).push(v), r),
      {}
    );

    return Object.values(msgKeyedByInterlocutorSets);
  }

  async subscribe(handle) {
    await this.#webSocket.openWebSocketFor(handle);
  }

  unsubscribe(handle) {
    this.#webSocket.closeWebSocketFor(handle);
  }
}
