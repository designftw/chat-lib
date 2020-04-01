/**
 * The account is used for login so that a user can access multiple aliases.
 *
 * Information about the account is not associated with messages or shared
 * with other users. Messages are sent and received using aliases.
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
		 * Private arbitrary metadata about an account stored as a string.
		 * @type{string}
		 */
		this.payload = payload;

	}

}

/**
 * The alias is the recipient or sender of messages.
 *
 * One account can have multiple aliases, for example an account could
 * have a personal and work alias. The chat UI can allow the user
 * to send and receive messages from multiple aliases at once.
 */
class Alias {

	/**
	 * Alias model constructor.
	 *
	 * @param {string} id see [Alias's id property]{@link Alias#id}
	 * @param {string} name see [Alias's name property]{@link Alias#name}
	 * @param {string} payload see [Alias's payload property]{@link Alias#payload}
	 */
	constructor(id, name, payload = "") {
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
		 * @type{string}
		 */
		this.payload = payload;
	}
}

class Message {
	constructor() {}
}

class Contacts {
	constructor() {}
}

class Token {
	constructor() {}
}