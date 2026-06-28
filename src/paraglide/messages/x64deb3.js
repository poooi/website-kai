/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} X64deb3Inputs */

const en_x64deb3 = /** @type {(inputs: X64deb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64-bit DEB`)
};

const fr_x64deb3 = /** @type {(inputs: X64deb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`DEB 64 bits`)
};

const ja_x64deb3 = /** @type {(inputs: X64deb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64ビットDEB`)
};

const ko_x64deb3 = /** @type {(inputs: X64deb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64비트 DEB`)
};

const zh_hans1_x64deb3 = /** @type {(inputs: X64deb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64位DEB`)
};

const zh_hant1_x64deb3 = /** @type {(inputs: X64deb3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64位元DEB`)
};

/**
* | output |
* | --- |
* | "64-bit DEB" |
*
* @param {X64deb3Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const x64deb3 = /** @type {((inputs?: X64deb3Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<X64deb3Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_x64deb3(inputs)
	if (locale === "fr") return fr_x64deb3(inputs)
	if (locale === "ja") return ja_x64deb3(inputs)
	if (locale === "ko") return ko_x64deb3(inputs)
	if (locale === "zh-Hans") return zh_hans1_x64deb3(inputs)
	return zh_hant1_x64deb3(inputs)
});
export { x64deb3 as "x64DEB" }