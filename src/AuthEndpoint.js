import {
	createAccountFromAccountDTO,
	getErrorFromResponse,
	createDefaultRequestInit,
	} from "./util.js";

/**
 * Helper class for authentication routes.
 */
export default class AuthEndpoint {
	/**
	 * AuthEndpoint constructor.
	 *
	 * @param {ClientStore} store see [Client's store property]{@link Client#store}
	 */
	constructor(store) {
		/**
		 * See [Client's store property]{@link Client#store}
		 * @type {ClientStore}
		 */
		this.store = store;
	}

	/**
	 * Sign up for a new account with a single initial alias.
	 * @param {string} alias The name of the initial alias if signup is successful.
	 * @param {string} email The email address associated with the account.
	 * @param {string} password The password associated with the account.
	 * @returns {Promise<any>} A success message upon successful login
	 */
	signup(alias, email, password) {
		let route = "signup";

		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({
				method: "POST",
				body: { alias, email, password },
			})
		)
		.then(getErrorFromResponse)
		.then((res) => res.json());
	}

	/**
	 * Login to an existing account.
	 * @param {string} email The email address associated with the account.
	 * @param {string} password The password associated with the account.
	 * @returns {Promise<Account>} Upon success returns the account which was logged in.
	 */
	login(email, password) {
		let route = "login";

		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({
				method: "POST",
				body: { email, password },
			})
		)
		.then(getErrorFromResponse)
		.then((res) => res.json())
		.then((res) => {
			return createAccountFromAccountDTO(res.account);
		});
	}

	/**
	 * Logout of the currently logged in account
	 * @returns {Promise<void>} Upon success returns nothing.
	 */
	logout() {
		let route = "logout";

		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({ method: "POST" })
		)
		.then(getErrorFromResponse)
		.then((res) => {
			return;
		});
	}

	/**
	 * Check if the client is currently logged in
	 * @returns {Promise<{isLoggedIn: boolean, account: Account | undefined}>} an
	 * object with two keys isLoggedIn and account. If isLoggedIn is true then
	 * account contains has the currently logged in account. If isLoggedIn is
	 * false then account is undefined.
	 */
	isLoggedIn() {
		let route = "isloggedin";

		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({ method: "GET" })
		)
		.then(getErrorFromResponse)
		.then((res) => res.json())
		.then((json) => {
			return {
			isLoggedIn: json.response,
			account: json.data
				? createAccountFromAccountDTO(json.data)
				: undefined,
			};
		});
	}
}