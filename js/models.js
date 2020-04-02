/** // TODO(lukemurray)
 * I still think there is some confusion over the term payload.
 *
 * Here are some things we could want to do with a payload
 * - these are shared state but should only be settable by the owner of the object
 * 	 - mark an alias as typing
 *   - mark an alias as available
 * - this could be shared state but overridden by other users
 * 	 - provide an avatar to an alias
 * - these are things we may want to do to messages
 *   - add reactions to a message
 *   - add arbitrary fields to a message i.e.
 *
 * How do we say this property in payload is only modifiable by the owner?
 * Could we provide an override model, and use object merging? {...owner, ...recipient} to allow owner to set defaults and recipient overrides
 *  - this would allow for things like overriding people's avatars
 */


/**
 * The account is used for logging into the chat server and accessing aliases.
 *
 * The account is not used for sending or receiving messages. All messages
 * are sent and received using aliases.
 */
class Account {
	/**
	 * Account model constructor.
	 *
	 * @param {string} id see [Account's id property]{@link Account#id}
	 * @param {string} email see [Account's email property]{@link Account#email}
	 * @param {string} payload see [Account's payload property]{@link Account#payload}
	 */
	constructor(id, email, payload = "") {
		/**
		 * The id of the account.
		 *
		 * Unique across all accounts.
		 * @type{string}
		 */
		this.id = id;

		/**
		 * The email address associated with the account.
		 *
		 * Unique across all accounts.
		 * @type{string}
		 */
		this.email = email;

		/**
		 * Private arbitrary metadata about an alias stored as a string.
		 *
		 * The payload is used so that users can store arbitrary metadata
		 * with objects used in the chat application. For example a user
		 * could mark an alias as important.
		 * @type{string}
		 */
		this.payload = payload;

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
class Alias {

	/**
	 * Alias model constructor.
	 *
	 * @param {string} id see [Alias's id property]{@link Alias#id}
	 * @param {string} name see [Alias's name property]{@link Alias#name}
	 * @param {string} payload see [Alias's payload property]{@link Alias#payload}
	 * @param {Alias[]} contacts see [Alias's contacts property]{@link Alias#contacts}
	 */
	constructor(id, name, payload = "", contacts = []) {
		/**
		 * The id of the alias.
		 *
		 * Unique across all aliases.
		 * @type{string}
		 */
		this.id = id;

		/**
		 * The name associated with the alias.
		 *
		 * Unique across all aliases.
		 * @type{string}
		 */
		this.name = name;

		/**
		 * Private arbitrary metadata about an alias stored as a string.
		 *
		 * The payload is used so that users can store arbitrary metadata
		 * with objects used in the chat application. For example a user
		 * could mark an alias as important.
		 * @type{string}
		 */
		this.payload = payload;


		/**
		 * Contact of the alias.
		 *
		 * This field is only populated for aliases associated with the logged in account.
		 * @type{Alias[]}
		 */
		this.contacts = [];
	}
}

/**
 * Represents a Message
 */
class Message {
	constructor(sender, recipient, payload) {
		/**
		 * The sender of the message
		 * @type{Alias}
		 */
		this.sender = sender;
		/**
		 * The recipient of the message
		 * @type{Alias}
		 */
		this.recipient = recipient;
		/**
		 * The data associated with the message.
		 *
		 * This could be just message text but could also be arbitrary JSON.
		 * @type{string}
		 */
		this.payload = payload;

	}
}