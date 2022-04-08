import BaseModel from "./BaseModel.js";

/**
 * The account represents login credentials for a user and is returned by
 * methods from the authentication process such as [login]{@link Client#login}.
 *
 * The account is *not* used for sending or receiving messages.
 * All messages are sent to and from [Identities]{@link Identity}.
 * Accounts store the [email address]{@link Account#email} used for
 * [login]{@link Client#login} and the [handle]{@link Account#handle} provided
 * by the user during [sign up]{@link Client#signup}.
 * The [handle]{@link Account#handle} is used as the default argument for
 * [Client]{@link Client} methods that expect a [handle]{@link Identity#handle}
 * argument for the currently logged in user.
 */
export default class Account extends BaseModel {
	/**
	 * ```js
	 * import Account from "https://designftw.github.io/chat-lib/src/models/Account.js";
	 * ```
	 *
	 * Constructor for the Account.
	 * Should not be called directly, the [Account]{@link Account} is returned by
	 * the [Client's]{@link Client} [login]{@link Client#login} method.
	 *
	 * @param {Object} options An object containing the following properties.
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
		 * The default handle associated with the account.
		 * Defaults to the handle provided during [sign up]{@link Client#signup}.
		 *
		 * Unique across all accounts.
		 * @type {string}
		 */
		this.handle = handle;
	}

	/**
	 * Convert this account to a JSON object that could be fed to its constructor to create another object with the same data
	 * @returns {Object}
	 */
	 toJSON() {
		return {
			...super.toJSON(),
			handle: this.handle,
			email: this.email
		}
	}
}
