import Endpoint from "./Endpoint.js";
import PrivateData from "../models/PrivateData.js";

/**
 * The Private Payload endpoint of the chat server
 * @ignore
 */
export default class PrivateDataEndpoint extends Endpoint {
	/**
	 * PrivateDataEndpoint constructor.
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
	 * @param {Object} data the payload, private to the passed in alias, to be attached to the passed in model.
	 * @returns {Promise<PrivateData>} the newly created private payload.
	 */
	async createPayload(ownAlias, entityId, data) {
		let resultDTO = await this.request("payloads", {
			method: "POST",
			body: { payload: JSON.stringify(data), entity_id: entityId },
			headers: {
				"user-alias-name": ownAlias,
			},
		});

		const payloadDTO = resultDTO.data;
		return new PrivateData({...payloadDTO, data: payloadDTO.payload});
	}

	/**
	 * Get the payload associated with the passed in alias and entity.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the returned payload is attached to.
	 * @returns {Promise<PrivateData>} the requested PrivatePayload model.
	 */
	async getPayload(ownAlias, entityId) {
		let payloadDTO = await this.request(`payloads/${entityId}`, {
			headers: {
				"user-alias-name": ownAlias,
			},
		});

		return new PrivateData({...payloadDTO[0], data: payloadDTO[0].payload});
	}

	/**
	 * Update the payload associated with the passed in alias and entity.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload to update is attached to.
	 * @param {Object} newData the new payload to attach to the alias and model
	 * @returns {Promise<PrivateData>} the updated private payload model.
	 */
	async updatePayload(ownAlias, entityId, newData) {
		const {id: payloadId} = await this.getPayload(ownAlias, entityId);
		let resultDTO = await this.request(`payloads/${payloadId}`, {
			method: "PUT",
			body: { payload: JSON.stringify(newData) },
			headers: {
				"user-alias-name": ownAlias,
			},
		});

		const payloadDTO = resultDTO.data;
		return new PrivateData({...payloadDTO, data: payloadDTO.payload});
	}

	/**
	 * Delete the payload associated with the passed in alias and entity.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload to delete is attached to.
	 * @returns {Promise<any>} a validation message.
	 */
	async deletePayload(ownAlias, entityId) {
		const {id: payloadId} = await this.getPayload(ownAlias, entityId);
		return this.request(`payloads/${payloadId}`, {
			method: "DELETE",
			headers: {
				"user-alias-name": ownAlias,
			},
		});
	}
}
