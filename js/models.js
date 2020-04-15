/**
 * Base class for all models
 */
export class BaseModel {
  /**
   * Constructor for the base model.
   * @param {string} id see [BaseModel's id property]{@link BaseModel#id}
   * @param {Date} createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
   * @param {Date} updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
   */
  constructor(id, createdAt, updatedAt) {
    /**
     * The id of the model.
     *
     * Unique across all models of the same type.
     * @type {string}
     */
    this.id = id;

    /**
     * The date that the model was created.
     * @type {Date}
     */
    this.createdAt = createdAt;

    /**
     * The date that the model was last updated.
     * @type {Date}
     */
    this.updatedAt = updatedAt;
  }
}

/**
 * The account is used for logging into the chat server and accessing aliases.
 *
 * The account is not used for sending or receiving messages. All messages
 * are sent and received using aliases.
 */
export class Account extends BaseModel {
  /**
   * Account model constructor.
   *
   * @param {string} id see [BaseModel's id property]{@link BaseModel#id}
   * @param {Date} createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
   * @param {Date} updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
   * @param {string} email see [Account's email property]{@link Account#email}
   */
  constructor(id, createdAt, updatedAt, email) {
    super(id, createdAt, updatedAt);
    /**
     * The email address associated with the account.
     *
     * Unique across all accounts.
     * @type {string}
     */
    this.email = email;
  }
}

/**
 * The alias is the recipient or sender of messages.
 *
 * One account can have multiple aliases, for example an account could
 * have a personal and work alias. The chat UI could allow the user
 * to send and receive messages from multiple aliases at once. Similar to
 * associating multiple email addresses with on gmail account, or having
 * multiple slack workspaces logged in.
 */
export class Alias extends BaseModel {
  /**
   * Alias model constructor.
   *
   * @param {number} id see [BaseModel's id property]{@link BaseModel#id}
   * @param {Date} createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
   * @param {Date} updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
   * @param {string} name see [Alias's name property]{@link Alias#name}
   * @param {string} payload see [Alias's payload property]{@link Alias#payload}
   */
  constructor(id, createdAt, updatedAt, name, payload) {
    super(id, createdAt, updatedAt);

    /**
     * The name associated with the alias. This is used to display
     * the alias in the UI.
     *
     * Unique across all aliases.
     * @type {string}
     */
    this.name = name;

    /**
     * Public arbitrary metadata about an alias stored as a string.
     *
     * The payload is used so that users can store arbitrary metadata
     * with objects used in the chat application. For example a user
     * could publicly assign availability to their alias, or provide a public
     * link to an avatar.
     * @type {string}
     */
    this.payload = payload;
  }
}

/**
 * Represents a Message
 */
export class Message extends BaseModel {
  /**
   * Message model constructor.
   *
   * @param {string} id see [BaseModel's id property]{@link BaseModel#id}
   * @param {Date} createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
   * @param {Date} updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
   * @param {Alias} sender see [Message's sender property]{@link Message#sender}
   * @param {Alias[]} recipients see [Message's recipients property]{@link Message#recipients}
   * @param {string} payload see [Message's payload property]{@link Message#payload}
   */
  constructor(id, createdAt, updatedAt, sender, recipients, payload) {
    super(id, createdAt, updatedAt);
    /**
     * The id of the Alias which sent the message. See [Alias's id Property]{@link Alias#id}
     * @type {Alias}
     */
    this.sender = sender;
    /**
     * The ids of the Aliases which received the message. See [Alias's id Property]{@link Alias#id}
     * @type {Alias[]}
     */
    this.recipients = recipients;
    /**
     * The data associated with the message.
     *
     * This could be just message text but could also be arbitrary JSON.
     * @type {string}
     */
    this.payload = payload;
  }
}

/**
 * Represents a private payload attached to an entity in the database.
 */
export class PrivatePayload extends BaseModel {
  /**
   * PrivatePayload model constructor.
   *
   * @param {string} id see [BaseModel's id property]{@link BaseModel#id}
   * @param {Date} createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
   * @param {Date} updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
   * @param {number} entityId see [PrivatePayload's entityId property]{@link PrivatePayload#entityId}
   * @param {string} payload see [PrivatePayload's payload property]{@link PrivatePayload#payload}
   */
  constructor(id, createdAt, updatedAt, entityId, payload) {
    super(id, createdAt, updatedAt);
    /**
     * The id of the object this payload is attached to.
     * @type {number}
     */
    this.entityId = entityId;

    /**
     * The data associated with the private payload.
     * @type {string}
     */
    this.payload = payload;
  }
}
