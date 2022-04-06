import Endpoint from "./Endpoint.js";
import PrivatePayload from "./PrivatePayload.js";

/**
 * The Private Payload endpoint of the chat server
 */
export default class PrivatePayloadsEndpoint extends Endpoint {
	/**
	 * PrivatePayloadEndpoint constructor.
	 *
	 * @param {Client} client see [Endpoint's client property]{@link Endpoint#client}
	 */
	constructor(client) {
		super(client);
	}

	/**
	 * Create a new private payload.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload is attached to.
	 * @param {string} payload the payload, private to the passed in alias, to be attached to the passed in model.
	 * @returns {Promise<PrivatePayload>} the newly created private payload.
	 */
	async createPayload(ownAlias, entityId, payload) {
		let resultDTO = await this.request("payloads", {
			method: "POST",
			body: { payload, entity_id: entityId },
			headers: {
				"user-alias-name": ownAlias,
			},
		});

		const payloadDTO = resultDTO.data;
		return new PrivatePayload(payloadDTO);
	}

	/**
	 * Get the payload associated with the passed in alias and entity.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the returned payload is attached to.
	 * @returns {Promise<PrivatePayload>} the requested PrivatePayload model.
	 */
	async getPayload(ownAlias, entityId) {
		let payloadDTO = await this.request(`payloads/${entityId}`, {
			headers: {
				"user-alias-name": ownAlias,
			},
		});

		return new PrivatePayload(payloadDTO);
	}

	/**
	 * Update the payload associated with the passed in alias and entity.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload to update is attached to.
	 * @param {string} newPayload the new payload to attach to the alias and model
	 * @returns {Promise<PrivatePayload>} the updated private payload model.
	 */
	async updatePayload(ownAlias, entityId, newPayload) {
		let resultDTO = await this.request(`payloads/${entityId}`, {
			method: "PUT",
			body: { payload: newPayload },
			headers: {
				"user-alias-name": ownAlias,
			},
		});

		const payloadDTO = resultDTO.data;
		return new PrivatePayload(payloadDTO);
	}

	/**
	 * Delete the payload associated with the passed in alias and entity.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload to delete is attached to.
	 * @returns {Promise<any>} a validation message.
	 */
	deletePayload(ownAlias, entityId) {
		return this.request(`payloads/${entityId}`, {
			method: "DELETE",
			headers: {
				"user-alias-name": ownAlias,
			},
		});
	}
}
