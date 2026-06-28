/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Armdeb3Inputs */

const en_armdeb3 = /** @type {(inputs: Armdeb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM DEB`)
};

const fr_armdeb3 = /** @type {(inputs: Armdeb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`DEB ARM`)
};

const ja_armdeb3 = /** @type {(inputs: Armdeb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM DEB`)
};

const ko_armdeb3 = /** @type {(inputs: Armdeb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM DEB`)
};

const zh_hans1_armdeb3 = /** @type {(inputs: Armdeb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM DEB`)
};

const zh_hant1_armdeb3 = /** @type {(inputs: Armdeb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM DEB`)
};

/**
* | output |
* | --- |
* | "ARM DEB" |
*
* @param {Armdeb3Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const armdeb3 = /** @type {((inputs?: Armdeb3Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Armdeb3Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_armdeb3(inputs)
	if (locale === "fr") return fr_armdeb3(inputs)
	if (locale === "ja") return ja_armdeb3(inputs)
	if (locale === "ko") return ko_armdeb3(inputs)
	if (locale === "zh-Hans") return zh_hans1_armdeb3(inputs)
	return zh_hant1_armdeb3(inputs)
});
export { armdeb3 as "armDEB" }