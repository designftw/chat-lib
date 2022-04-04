import BaseModel from "./BaseModel.js";

/**
 * Represents a private payload attached to an entity in the database.
 */
export default class PrivatePayload extends BaseModel {
	/**
	 * PrivatePayload model constructor.
	 *
	 * @param {string} id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 * @param {string} entityId see [PrivatePayload's entityId property]{@link PrivatePayload#entityId}
	 * @param {string} payload see [PrivatePayload's payload property]{@link PrivatePayload#payload}
	 */
	constructor(id, createdAt, updatedAt, entityId, payload) {
		super(id, createdAt, updatedAt);

		/**
		 * The id of the object this payload is attached to.
		 * @type {string}
		 */
		this.entityId = entityId;

		/**
		 * The data associated with the private payload.
		 * @type {string}
		 */
		this.payload = payload;
	}
}