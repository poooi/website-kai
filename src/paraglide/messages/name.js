/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} NameInputs */

const en_name = /** @type {(inputs: NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi`)
};

const fr_name = /** @type {(inputs: NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi`)
};

const ja_name = /** @type {(inputs: NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi`)
};

const ko_name = /** @type {(inputs: NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi`)
};

const zh_hans1_name = /** @type {(inputs: NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi`)
};

const zh_hant1_name = /** @type {(inputs: NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi`)
};

/**
* | output |
* | --- |
* | "poi" |
*
* @param {NameInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const name = /** @type {((inputs?: NameInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<NameInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_name(inputs)
	if (locale === "fr") return fr_name(inputs)
	if (locale === "ja") return ja_name(inputs)
	if (locale === "ko") return ko_name(inputs)
	if (locale === "zh-Hans") return zh_hans1_name(inputs)
	return zh_hant1_name(inputs)
});