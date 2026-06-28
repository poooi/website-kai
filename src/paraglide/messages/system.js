/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} SystemInputs */

const en_system = /** @type {(inputs: SystemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`System`)
};

const fr_system = /** @type {(inputs: SystemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Système`)
};

const ja_system = /** @type {(inputs: SystemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`システム`)
};

const ko_system = /** @type {(inputs: SystemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`체계`)
};

const zh_hans1_system = /** @type {(inputs: SystemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`系统`)
};

const zh_hant1_system = /** @type {(inputs: SystemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`系統`)
};

/**
* | output |
* | --- |
* | "System" |
*
* @param {SystemInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const system = /** @type {((inputs?: SystemInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<SystemInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_system(inputs)
	if (locale === "fr") return fr_system(inputs)
	if (locale === "ja") return ja_system(inputs)
	if (locale === "ko") return ko_system(inputs)
	if (locale === "zh-Hans") return zh_hans1_system(inputs)
	return zh_hant1_system(inputs)
});