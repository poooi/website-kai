/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} ArmInputs */

const en_arm = /** @type {(inputs: ArmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM`)
};

const fr_arm = /** @type {(inputs: ArmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM`)
};

const ja_arm = /** @type {(inputs: ArmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM`)
};

const ko_arm = /** @type {(inputs: ArmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM`)
};

const zh_hans1_arm = /** @type {(inputs: ArmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM`)
};

const zh_hant1_arm = /** @type {(inputs: ArmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM`)
};

/**
* | output |
* | --- |
* | "ARM" |
*
* @param {ArmInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const arm = /** @type {((inputs?: ArmInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<ArmInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_arm(inputs)
	if (locale === "fr") return fr_arm(inputs)
	if (locale === "ja") return ja_arm(inputs)
	if (locale === "ko") return ko_arm(inputs)
	if (locale === "zh-Hans") return zh_hans1_arm(inputs)
	return zh_hant1_arm(inputs)
});