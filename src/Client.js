import ClientStore from "./ClientStore.js";
import API from "./API.js";
import Account from "./Account.js";
import Alias from "./Alias.js";
import Message from "./Message.js";
import PrivatePayload from "./PrivatePayload.js";

/**
 * onUnauthorizedAccess: detail is {message, aliasName}
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
 * @event onDeleteMessage
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and alias name of the message which was deleted.
 */

/**
 * Update Message Event
 *
 * Called when a message is updated. For example if the payload changes. Use
 * [getMessageById]{@link Client#getMessageById} to get information about the updatedMessage such as the
 * new payload.
 * @event onUpdateMessage
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and alias name of the message which was updated.
 */

/**
 * New Message Event
 *
 * Called when a new message is available. Call [getMessageById]{@link Client#getMessageById} to get
 * information about the new message.
 * @event onNewMessage
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and alias name of the message which was created.
 */

/**
 * The Client is the interface for interacting with the ChatServer.
 * @fires onDeleteMessage
 * @fires onUpdateMessage
 * @fires onNewMessage
 */
export default class Client extends EventTarget {
  /**
   * Client constructor.
   * @param {string} host see [ClientStore's host property]{@link ClientStore#host}
   */
  constructor(host) {
    super();
    /**
     * A reference to the [ClientStore]{@link ClientStore} which contains global state of the chat application.
     * @type {ClientStore}
     */
    this.store = new ClientStore(host);

    /**
     * A reference to the [API]{@link API}, a helper class for communicating with the Chat Server.
     * @type {API}
     */
    this.api = new API(this.store, this);
  }

  /**
   * Sign up for a new account with a single initial alias.
   * @param {string} alias The name of the initial alias if signup is successful.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<any>} A validation message
   */
  signup(alias, email, password) {
    return this.api.auth.signup(alias, email, password);
  }

  /**
   * Login to an existing account.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<Account>} Upon success returns the account which was logged in.
   */
  login(email, password) {
    return this.api.auth.login(email, password).then((res) => {
      this.dispatchEvent(new CustomEvent("login", { detail: res }));
      return res;
    });
  }

  /**
   * Logout of an existing account
   */
  logout() {
    this.dispatchEvent(new Event("logout"));
    return this.api.auth.logout();
  }

  /**
   * Check if the user is currently logged in
   */
  isLoggedIn() {
    return this.api.auth.isLoggedIn();
  }

  /**
   * Get all the messages for the passed in alias
   *
   * Note the currently logged in account must own the alias associated with the aliasName.
   * @param {string} aliasName the name of the alias to get messages for.
   * @param {string[]} [interlocutors] an optional list of the senders and recipients of the messages.
   * @param {Date} [sinceTime] an optional date to limit the request by. only receive messages since this date.
   * @returns {Promise<Message[]>} a list of messages which pass the filters.
   */
  getMessagesForAlias(aliasName, interlocutors, sinceTime) {
    return this.api.messages.getMessagesForAlias(
      aliasName,
      interlocutors,
      sinceTime
    );
  }

  /**
   * Get a message which has the passed in messageId, and was sent or received by the passed in aliasName.
   *
   * Note the currently logged in account must own the alias associated with the aliasName.
   * @param {string} aliasName the name of the alias which sent or received the message.
   * @param {string} messageId the id of the message to get.
   * @returns {Promise<Message>} The model of the message with the associated id.
   */
  getMessageById(aliasName, messageId) {
    return this.api.messages.getMessage(aliasName, messageId);
  }

  /**
   * Send a message from the passed in alias to the passed in recipients with the passed in payload.
   *
   * Note the currently logged in account must own the alias associated with the aliasName.
   * @param {string} aliasName the name of the alias which will send the message.
   * @param {string[]} recipientNames a list of recipients of the message.
   * @param {string} payload the payload associated with the message.
   * @returns {Promise<Message>} The model of the sent message.
   */
  sendMessage(aliasName, recipientNames, payload) {
    return this.api.messages.sendMessage(aliasName, recipientNames, payload);
  }

  /**
   * Update a message with the passed in messageId which was sent by the passed in aliasName.
   * @param {string} aliasName the name of the alias which sent the message.
   * @param {string} messageId the id associated with the message.
   * @param {string} payload the new payload for the message.
   * @returns {Promise<Message>} The model of the updated message.
   */
  updateMessage(aliasName, messageId, payload) {
    return this.api.messages.updateMessage(aliasName, messageId, payload);
  }

  /**
   * Delete a message with the passed in messageId which was sent by the passed in aliasName.
   * @param {string} aliasName the name of the alias which sent the message.
   * @param {string} messageId the id associated with the message.
   * @returns {Promise<any>} a validation message.
   */
  deleteMessage(aliasName, messageId) {
    return this.api.messages.deleteMessage(aliasName, messageId);
  }

  /**
   * Get all the aliases for the currently logged in account.
   * @returns {Promise<Alias[]>} An array of Alias models.
   */
  getAliasesForAccount() {
    return this.api.aliases.getAliasesForAccount().then(async (aliases) => {
      for (let alias of aliases) {
        await this.api.webSocket.openWebSocketFor(alias.name);
      }

      return aliases;
    });
  }

  /**
   * Get an alias by its name
   * @param {string} aliasName the name of the alias to get
   * @returns {Promise<Alias>} The Alias model associated with the passed in name
   */
  getAlias(aliasName) {
    return this.api.aliases.getAlias(aliasName);
  }

  /**
   * Create a new alias with the passed in aliasName and payload.
   * @param {string} aliasName the name of the new alias
   * @param {string} payload the payload on the new alias.
   * @returns {Promise<Alias>} The Alias model of the newly created alias.
   */
  createAlias(aliasName, payload) {
    return this.api.aliases.createAlias(aliasName, payload);
  }

  /**
   * Update an existing alias.
   * @param {Alias} alias the model of the alias to update
   * @param {string} [name] the optional new name for the alias
   * @param {string} [payload] the optional new payload for the alias
   * @returns {Promise<Alias>} The Alias model of the newly updated alias.
   */
  updateAlias(alias, name, payload) {
    return this.api.aliases.updateAlias(alias, name, payload);
  }

  /**
   * Delete the alias associated with the passed in alias name.
   * @param {string} aliasName the name of the alias to delete.
   * @returns {Promise<any>} A validation message.
   */
  deleteAlias(aliasName) {
    return this.api.aliases.deleteAlias(aliasName);
  }

  /**
   * Create a new private payload for the passed in entity, private to the passed in alias.
   * @param {string} aliasName the name of the alias which is creating the payload.
   * @param {string} entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload is attached to.
   * @param {string} payload the payload to attach to the entity associated with the passed in entityId, private to the alias associated with the passed in alias name.
   * @returns {Promise<PrivatePayload>} the new private payload.
   */
  createPrivatePayload(aliasName, entityId, payload) {
    return this.api.privatePayloads.createPayload(aliasName, entityId, payload);
  }

  /**
   * Get the private payload associated with the passed in alias and entity.
   * @param {string} aliasName the name of the alias associated with the payload to get.
   * @param {string} entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload to get is attached to.
   * @returns {Promise<PrivatePayload>} the private payload associated with the passed in alias and entity.
   */
  getPrivatePayload(aliasName, entityId) {
    return this.api.privatePayloads.getPayload(aliasName, entityId);
  }

  /**
   * Update the private payload associated with the passed in alias and entity.
   * @param {string} aliasName the name of the alias associated with the payload to update.
   * @param {string} entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload to update is attached to.
   * @param {string} newPayload the new private payload.
   * @returns {Promise<PrivatePayload>} the updated private payload.
   */
  updatePrivatePayload(aliasName, entityId, newPayload) {
    return this.api.privatePayloads.updatePayload(
      aliasName,
      entityId,
      newPayload
    );
  }

  /**
   * Delete the private payload associated with the passed in alias and entity.
   * @param {string} aliasName the name of the alias associated with the payload to delete.
   * @param {string} entityId the [id]{@link BaseModel#id} of the entity ({@link Message}, {@link Alias}, or {@link Account}) the payload to delete is attached to.
   * @returns {Promise<any>} A validation message.
   */
  deletePrivatePayload(aliasName, entityId) {
    return this.api.privatePayloads.deletePayload(aliasName, entityId);
  }

  /**
   * Get all the friends of the passed in alias.
   * @param {string} ownAlias the name of the alias whose friends will be retrieved.
   * @returns {Promise<Alias[]>} an array of aliases. These are the passed in alias's friends.
   */
  getFriendsForAlias(ownAlias) {
    return this.api.friends.getFriendsForAlias(ownAlias);
  }

  /**
   * Add a new friend to the friend list of the passed in alias.
   * @param {string} ownAlias the name of the alias adding a friend.
   * @param {string} newFriendAlias the name of the alias which is going to be added to ownAlias's friend list.
   * @returns {Promise<any>} a validation message.
   */
  addFriend(ownAlias, newFriendAlias) {
    return this.api.friends.addFriend(ownAlias, newFriendAlias);
  }

  /**
   * Remove a friend from the friend list of the passed in alias.
   * @param {string} ownAlias the name of the alias removing a friend.
   * @param {string} prevFriendAlias the name of the alias which is going to be removed from ownAlias's friend list.
   * @returns {Promise<any>} a validation message.
   */
  removeFriend(ownAlias, prevFriendAlias) {
    return this.api.friends.removeFriend(ownAlias, prevFriendAlias);
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