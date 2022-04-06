import Account from "./models/Account.js";
import Alias from "./models/Alias.js";
import Message from "./models/Message.js";
import PrivatePayload from "./models/PrivatePayload.js";

import WebSocketEndpoint from "./endpoints/WebSocketEndpoint.js";
import AuthEndpoint from "./endpoints/AuthEndpoint.js";
import AliasesEndpoint from "./endpoints/AliasesEndpoint.js";
import MessagesEndpoint from "./endpoints/MessagesEndpoint.js";
import PrivatePayloadsEndpoint from "./endpoints/PrivatePayloadsEndpoint.js";
import FriendsEndpoint from "./endpoints/FriendsEndpoint.js";

/**
 * autherror: detail is {message, aliasName}
 */

/**
 * Object passed to details on CustomEvents about messages fired by the Client.
 * @typedef {object} messageEventDetails
 * @property {string} messageId the id of the message the event is referring to
 * @property {string} aliasName the alias the event is associated with.
 */

/**
 * Delete Message Event. Called when a message is deleted.
 *
 * When a message is deleted it no longer exists on the server so you cannot call
 * [getMessageById]{@link Client#getMessageById} to get information about a deleted message.
 * @event messagedelete
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and alias name of the message which was deleted.
 */

/**
 * Update Message Event
 *
 * Called when a message is updated. For example if the payload changes. Use
 * [getMessageById]{@link Client#getMessageById} to get information about the updatedMessage such as the
 * new payload.
 * @event messageupdate
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and alias name of the message which was updated.
 */

/**
 * New Message Event
 *
 * Called when a new message is available. Call [getMessageById]{@link Client#getMessageById} to get
 * information about the new message.
 * @event message
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and alias name of the message which was created.
 */

/**
 * The Client is the interface for interacting with the ChatServer.
 * @fires messagedelete
 * @fires messageupdate
 * @fires message
 */
export default class Client extends EventTarget {
  /**
   * Client constructor.
   * @param {string} host see [Client's host property]{@link Client#host}
   */
  constructor(host) {
    super();

    /**
     * The host of the chat server. Includes the hostname and port.
     * For example https://mozilla.org:4000.
     * Read-only.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/URL/host
     * @type {string}
     */
    Object.defineProperty(this, "host", {value: host});

     /**
      * Helper class for authorization routes.
      * @type {AuthEndpoint}
      */
     this.auth = new AuthEndpoint(this);

     /**
      * Helper class for alias routes.
      * @type {AliasesEndpoint}
      */
     this.aliases = new AliasesEndpoint(this);

     /**
      * Helper class for message routes.
      * @type {MessagesEndpoint}
      */
     this.messages = new MessagesEndpoint(this);

     /**
      * Helper class for private payload routes.
      * @type {PrivatePayloadsEndpoint}
      */
     this.privatePayloads = new PrivatePayloadsEndpoint(this);

     /**
      * Helper class for friends routes.
      * @type {FriendsEndpoint}
      */
     this.friends = new FriendsEndpoint(this);

     this.webSocket = new WebSocketEndpoint(this);

     /**
      * The logged in client account. Set in [login]{@link Client#login} and
      * unset in [logout]{@link Client#logout}.
      * @type {Account | undefined}
      */
     this.account = undefined;


    for (let event of ["message", "messageupdate", "messagedelete", "autherror"]) {
      this.webSocket.addEventListener(event, evt => this.dispatchEvent(evt));
    }
  }

  /**
   * Sign up for a new account with a single initial alias.
   * @param {string} aliasName The name of the initial alias if signup is successful.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<{message: string}>} A validation message
   */
  signup(aliasName, email, password) {
    return this.auth.signup(aliasName, email, password);
  }

  /**
   * Login to an existing account.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<Account>} Upon success returns the account which was logged in.
   */
  async login(email, password) {
    this.account = await this.auth.login(email, password);
    this.dispatchEvent(new CustomEvent("login", { detail: { account: this.account } }));
    return this.account;
  }

  /**
   * Logout of an existing account
   */
  async logout() {
    await this.auth.logout();
    this.account = undefined;
    this.dispatchEvent(new CustomEvent("logout"));
    return;
  }

  /**
   * Check if the user is currently logged in
   */
  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  /**
   * Get all the messages for the passed in alias
   *
   * Note the currently logged in account must own the alias associated with the aliasName.
   * @param {Object} options
   * @param {string} options.aliasName the name of the alias to get messages for.
   * @param {string[]} [options.interlocutors] an optional list of the senders and recipients of the messages.
   * @param {Date} [options.sinceTime] an optional date to limit the request by. only receive messages since this date.
   * @returns {Promise<Message[]>} a list of messages which pass the filters.
   */
  getMessages({ aliasName, interlocutors, sinceTime } = {}) {
    aliasName = aliasName ?? this.account.username;
    return this.messages.getMessagesForAlias(aliasName, interlocutors, sinceTime);
  }

  /**
   * Get a message which has the passed in messageId, and was sent or received by the passed in aliasName.
   *
   * Note the currently logged in account must own the alias associated with the aliasName.
   * @param {Object} options
   * @param {string} options.aliasName the name of the alias which sent or received the message.
   * @param {string} options.messageId the id of the message to get.
   * @returns {Promise<Message>} The model of the message with the associated id.
   */
  getMessageById({ aliasName, messageId } = {}) {
    aliasName = aliasName ?? this.account.username;
    return this.messages.getMessage(aliasName, messageId);
  }

  /**
   * Send a message from the passed in alias to the passed in recipients with the passed in payload.
   *
   * Note the currently logged in account must own the alias associated with the aliasName.
   * @param {Object} options
   * @param {string} options.aliasName the name of the alias which will send the message.
   * @param {string[]} options.recipientNames a list of recipients of the message.
   * @param {string} options.payload the payload associated with the message.
   * @returns {Promise<Message>} The model of the sent message.
   */
  sendMessage({aliasName, recipientNames, payload} = {}) {
    aliasName = aliasName ?? this.account.username;
    return this.messages.sendMessage(aliasName, recipientNames, payload);
  }

  /**
   * Update a message with the passed in messageId which was sent by the passed in aliasName.
   * @param {Object} options
   * @param {string} options.aliasName the name of the alias which sent the message.
   * @param {string} options.messageId the id associated with the message.
   * @param {string} options.payload the new payload for the message.
   * @returns {Promise<Message>} The model of the updated message.
   */
  updateMessage({aliasName, messageId, payload} = {}) {
    aliasName = aliasName ?? this.account.username;
    return this.messages.updateMessage(aliasName, messageId, payload);
  }

  /**
   * Delete a message with the passed in messageId which was sent by the passed in aliasName.
   * @param {Object} options
   * @param {string} options.aliasName the name of the alias which sent the message.
   * @param {string} options.messageId the id associated with the message.
   * @returns {Promise<any>} a validation message.
   */
  deleteMessage({aliasName, messageId} = {}) {
    aliasName = aliasName ?? this.account.username;
    return this.messages.deleteMessage(aliasName, messageId);
  }

  /**
   * Get all the aliases for the currently logged in account.
   * @returns {Promise<Alias[]>} An array of Alias models.
   */
  async getAliases() {
    let aliases = await this.aliases.getAliasesForAccount();

    for (let alias of aliases) {
      await this.webSocket.openWebSocketFor(alias.name);
    }

    return aliases;
  }

  /**
   * Get an alias by its name
   * @param {string} aliasName the name of the alias to get
   * @returns {Promise<Alias>} The Alias model associated with the passed in name
   */
  getAlias(aliasName) {
    return this.aliases.getAlias(aliasName);
  }

  /**
   * Create a new alias with the passed in aliasName and payload.
   * @param {Object} options
   * @param {string} options.aliasName the name of the new alias
   * @param {string} options.payload the payload on the new alias.
   * @returns {Promise<Alias>} The Alias model of the newly created alias.
   */
  createAlias({aliasName, payload} = {}) {
    return this.aliases.createAlias(aliasName, payload);
  }

  /**
   * Update an existing alias.
   * @param {string} aliasName the name of the alias to update.
   * @param {Object} updates object containing the updates to the alias.
   * @param {string} [updates.aliasName] the optional new name for the alias
   * @param {string} [updates.payload] the optional new payload for the alias
   * @returns {Promise<Alias>} The Alias model of the newly updated alias.
   */
  updateAlias(aliasName, { aliasName: newName, payload: newPayload } = {}) {
    return this.aliases.updateAlias(aliasName, {newName, newPayload});
  }

  /**
   * Delete the alias associated with the passed in alias name.
   * @param {string} aliasName the name of the alias to delete.
   * @returns {Promise<any>} A validation message.
   */
  deleteAlias(aliasName) {
    return this.aliases.deleteAlias(aliasName);
  }

  /**
   * Create a new private payload for the passed in entity, private to the passed in alias.
   * @param {Object} options
   * @param {string} options.aliasName the name of the alias which is creating the payload.
   * @param {string} options.entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload is attached to.
   * @param {string} options.payload the payload to attach to the entity associated with the passed in entityId, private to the alias associated with the passed in alias name.
   * @returns {Promise<PrivatePayload>} the new private payload.
   */
  createPrivatePayload({aliasName, entityId, payload} = {}) {
    aliasName = aliasName ?? this.account.username;
    return this.privatePayloads.createPayload(aliasName, entityId, payload);
  }

  /**
   * Get the private payload associated with the passed in alias and entity.
   * @param {Object} options
   * @param {string} options.aliasName the name of the alias associated with the payload to get.
   * @param {string} options.entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload to get is attached to.
   * @returns {Promise<PrivatePayload>} the private payload associated with the passed in alias and entity.
   */
  getPrivatePayload({aliasName, entityId} = {}) {
    aliasName = aliasName ?? this.account.username;
    return this.privatePayloads.getPayload(aliasName, entityId);
  }

  /**
   * Update the private payload associated with the passed in alias and entity.
   * @param {Object} options
   * @param {string} options.aliasName the name of the alias associated with the payload to update.
   * @param {string} options.entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload to update is attached to.
   * @param {string} options.newPayload the new private payload.
   * @returns {Promise<PrivatePayload>} the updated private payload.
   */
  updatePrivatePayload({aliasName, entityId, newPayload} = {}) {
    aliasName = aliasName ?? this.account.username;
    return this.privatePayloads.updatePayload(
      aliasName,
      entityId,
      newPayload
    );
  }

  /**
   * Delete the private payload associated with the passed in alias and entity.
   * @param {Object} options
   * @param {string} options.aliasName the name of the alias associated with the payload to delete.
   * @param {string} options.entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload to delete is attached to.
   * @returns {Promise<any>} A validation message.
   */
  deletePrivatePayload({aliasName, entityId} = {}) {
    aliasName = aliasName ?? this.account.username;
    return this.privatePayloads.deletePayload(aliasName, entityId);
  }

  /**
   * Get all the friends of the passed in alias.
   * @param {string} aliasName the name of the alias whose friends will be retrieved.
   * @returns {Promise<Alias[]>} an array of aliases. These are the passed in alias's friends.
   */
  getFriends(aliasName = this.account.username) {
    return this.friends.getFriendsForAlias(aliasName);
  }

  /**
   * Add a new friend to the friend list of the passed in alias.
   * @param {string} friendAlias the name of the alias which is going to be added to ownAlias's friend list.
   * @param {string} ownAlias the name of the alias adding a friend.
   * @returns {Promise<any>} a validation message.
   */
  addFriend(friendAlias, ownAlias=this.account.username) {
    return this.friends.addFriend(ownAlias, friendAlias);
  }

  /**
   * Remove a friend from the friend list of the passed in alias.
   * @param {string} friendAlias the name of the alias which is going to be removed from ownAlias's friend list.
   * @param {string} ownAlias the name of the alias removing a friend.
   * @returns {Promise<any>} a validation message.
   */
  removeFriend(friendAlias, ownAlias=this.account.username) {
    return this.friends.removeFriend(ownAlias, friendAlias);
  }

  /**
   * Given an array of Messages group the messages by unique groups of sender
   * and recipient aliases. For example if Alice sends Bob a message and Bob
   * sends Alice a message both of those messages are in the same group since
   * the set of sender and recipient aliases contains {Alice, Bob} for each
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
}
