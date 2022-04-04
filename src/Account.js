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