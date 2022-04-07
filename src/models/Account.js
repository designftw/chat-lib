import BaseModel from "./BaseModel.js";

/**
 * The account is used for logging into the chat server and accessing aliases.
 *
 * The account is not used for sending or receiving messages. All messages
 * are sent and received using aliases.
 */
export default class Account extends BaseModel {
	/**
	 * Account model constructor.
	 *
	 * @param {Object} options
	 * @param {string} options.id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} options.createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} options.updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 * @param {string} options.email see [Account's email property]{@link Account#email}
	 * @param {string} options.handle see [Account's username property]{@link Account#handle}
	 */
	constructor(options) {
		if (options instanceof Account) {
			return options;
		}

		const { id, createdAt, updatedAt, email, handle } = options;
		super({ id, createdAt, updatedAt });
		/**
		 * The email address associated with the account.
		 *
		 * Unique across all accounts.
		 * @type {string}
		 */
		this.email = email;

		/**
		 * The username associated with the account.
		 *
		 * Unique across all accounts.
		 * @type {string}
		 */
		this.handle = handle;
	}
}
