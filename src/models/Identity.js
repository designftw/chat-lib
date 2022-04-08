import BaseModel from "./BaseModel.js";

/**
 * The Identity is associated with a [handle]{@link Identity#handle}.
 * The handle can be used as the sender or recipient of messages, and can be
 * used to add friends.
 *
 * During [signup]{@link Client#signup} the user provides a [handle]{@link
 * Identity#handle} which is used to create a default [Identity]{@link Identity}
 * for the user.
 * That handle is accessible in the [Account]{@link * Account#handle} and is used
 * as the default argument for [Client]{@link * Client} methods that expect a
 * handle argument for the currently logged in user.
 *
 * Many chat applications will have a single [Identity]{@link Identity} for each
 * [Account]{@link Account}.
 * If your chat application uses one identity per account you can skip the rest
 * of this paragraph.
 * Some applications may have multiple [Identities]{@link Identity}
 * for a single [Account]{@link Account}.
 * For example, some email application allow users to login with a single set of
 * credentials, but send and receive messages from multiple email addresses.
 * For these types of applications, you can create multiple [Identities]{@link Identity}
 * using the [Client]{@link Client}.
 * Just be sure to sepcify the correct [handle]{@link Identity#handle} when
 * calling methods such as [sendMessage]{@link Client#sendMessage}.
 */
export default class Identity extends BaseModel {
	/**
	 * ```js
	 * import Identity from "https://designftw.github.io/chat-lib/src/models/Identity.js";
	 * ```
	 *
	 * Identity model constructor.
	 *
	 *
	 * @param {Object} options
	 * @param {string} options.id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} options.createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} options.updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 * @param {string} options.handle see [Identity's handle property]{@link Identity#handle}
	 * @param {string} options.data see [Identity's data property]{@link Identity#data}
	 */
	constructor(options) {
		if (options instanceof Identity) {
			return options;
		}

		const { id, createdAt, updatedAt, handle, data } = options;

		super({ id, createdAt, updatedAt });

		/**
		 * The unique handle associated with the identity.
		 * Used to specify the sender or recipient of messages and to add and remove friends.
		 *
		 * Must be unique across all identities.
		 * @type {string}
		 */
		this.handle = handle ?? options.name;

		/**
		 * Public readable object containing data associated with this identity.
		 * The [Account]{@link Account} that owns this [Identity]{@link Identity} can
		 * set this data using [Client#updateIdentity]{@link Client#updateIdentity}.
		 *
		 * The data can be any shape but it must be an object.
		 *
		 * *Practical Examples*
		 *
		 * The data could be a user's profile picture:
		 *
		 * ```js
		 * {image: "https://example.com/profile.png"}
		 * ```
		 *
		 * The data could be a user's status:
		 *
		 * ```js
		 * {status: "I'm online!"}
		 * ```
		 *
		 * The data could be a user's location:
		 *
		 * ```js
		 * {location: {lat: 42.3601, lng: 71.0942}}
		 * ```
		 *
		 * @type {Object}
		 */
		this.data = typeof(data) === "string" ? JSON.parse(data) : data;
	}

	/**
	 * When this identity is coerced to a string, just return the handle.
	 * @returns {string} This identity's handle
	 */
	toString() {
		return this.handle;
	}

	/**
	 * Convert this identity to a JSON object that could be fed to its constructor to create another object with the same data
	 * @returns {Object}
	 */
	toJSON() {
		return {
			...super.toJSON(),
			handle: this.handle,
			data: this.data
		}
	}
}
