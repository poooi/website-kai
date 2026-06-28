/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} OthersInputs */

const en_others = /** @type {(inputs: OthersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Others`)
};

const fr_others = /** @type {(inputs: OthersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autres`)
};

const ja_others = /** @type {(inputs: OthersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`他`)
};

const ko_others = /** @type {(inputs: OthersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`기타`)
};

const zh_hans1_others = /** @type {(inputs: OthersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`其它`)
};

const zh_hant1_others = /** @type {(inputs: OthersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`其它`)
};

/**
* | output |
* | --- |
* | "Others" |
*
* @param {OthersInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const others = /** @type {((inputs?: OthersInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<OthersInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_others(inputs)
	if (locale === "fr") return fr_others(inputs)
	if (locale === "ja") return ja_others(inputs)
	if (locale === "ko") return ko_others(inputs)
	if (locale === "zh-Hans") return zh_hans1_others(inputs)
	return zh_hant1_others(inputs)
});