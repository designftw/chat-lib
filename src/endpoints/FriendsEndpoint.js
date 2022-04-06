import Endpoint from "./Endpoint.js";

/**
 * The Friends endpoint of the chat server
 */
export default class FriendsEndpoint extends Endpoint {
	/**
	 * FriendsEndpoint constructor.
	 *
	 * @param {Client} client see [Endpoint's client property]{@link Endpoint#client}
	 */
	constructor(client) {
		super(client);
	}

	/**
	 * Get all the friends of the passed in alias.
	 * @param {string} ownAlias the alias whose friends will be retrieved.
	 * @returns {Promise<Alias[]>} an array of aliases which are friends with the passed in alias
	 */
	async getFriendsForAlias(ownAlias) {
		let friendsListDTO = await this.request("friends", {
			headers: {
				"user-alias-name": ownAlias,
			}
		});

		return friendsListDTO.map(aliasDTO => new Alias(aliasDTO));
	}

	/**
	 * Add a new friend to the friend list of ownAlias.
	 * @param {string} ownAlias the alias adding a friend.
	 * @param {string} newFriend the new friend of the ownAlias.
	 * @returns {Promise<any>} a validation message.
	 */
	async addFriend(ownAlias, newFriend) {
		return this.request("friends", {
			method: "POST",
			body: {
				alias_name: newFriend,
			},
			headers: {
				"user-alias-name": ownAlias
			},
		});
	}

	/**
	 * Remove a friend from the friend list of ownAlias.
	 * @param {string} ownAlias the alias removing a friend.
	 * @param {string} friendToRemove the friend to remove from ownAlias's friend list.
	 * @returns {Promise<any>} a validation message.
	 */
	async removeFriend(ownAlias, friendToRemove) {
		return this.request("friends", {
			method: "DELETE",
			body: {
				alias_name: friendToRemove,
			},
			headers: {
				"user-alias-name": ownAlias,
			},
		});
	}
}