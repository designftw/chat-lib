/**
 * The account is used for logging into the chat server and accessing aliases.
 *
 * The account is not used for sending or receiving messages. All messages
 * are sent and received using aliases.
 */
export class Account {
	/**
	 * Account model constructor.
	 *
	 * @param {string} id see [Account's id property]{@link Account#id}
	 * @param {string} email see [Account's email property]{@link Account#email}
	 * @param {Date} createdAt see [Account's createdAt property]{@link Account#createdAt}
	 * @param {Date} updatedAt see [Account's updatedAt property]{@link Account#updatedAt}
	 */
	constructor(id, email, createdAt, updatedAt) {
		/**
		 * The id of the account.
		 *
		 * Unique across all accounts.
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
export class Alias {

	/**
	 * Alias model constructor.
	 *
	 * @param {string} id see [Alias's id property]{@link Alias#id}
	 * @param {string} name see [Alias's name property]{@link Alias#name}
	 * @param {Date} createdAt see [Alias's createdAt property]{@link Alias#createdAt}
	 * @param {Date} updatedAt see [Alias's updatedAt property]{@link Alias#updatedAt}
	 * @param {string | null} payload see [Alias's payload property]{@link Alias#payload}
	 */
	constructor(id, name, createdAt, updatedAt, payload) {
		/**
		 * The id of the alias.
		 *
		 * Unique across all aliases.
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

		/**
		 * The name associated with the alias. This is used to display
		 * the alias in the UI.
		 *
		 * Unique across all aliases.
		 * @type {string}
		 */
		this.name = name;

		/**
		 * Private arbitrary metadata about an alias stored as a string.
		 *
		 * The payload is used so that users can store arbitrary metadata
		 * with objects used in the chat application. For example a user
		 * could mark an alias as important.
		 * @type {string | null}
		 */
		this.payload = null;

		/**
		 * Friends of the alias.
		 *
		 * This field is only populated for aliases associated with the logged in account.
		 * @type{Alias[] | null}
		 */
		this.friends = null;
	}
}

/**
 * Represents a Message
 */
export class Message {
	constructor(id, createdAt, updatedAt, sender, recipients, payload) {
		/**
		 * The id of the message.
		 *
		 * Unique across all aliases.
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

		/**
		 * The sender of the message
		 * @type{Alias}
		 */
		this.sender = sender;
		/**
		 * The recipient of the message
		 * @type{Alias[]}
		 */
		this.recipients = recipients;
		/**
		 * The data associated with the message.
		 *
		 * This could be just message text but could also be arbitrary JSON.
		 * @type{string}
		 */
		this.payload = payload;

	}
}