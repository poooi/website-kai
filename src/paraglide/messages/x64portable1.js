/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} X64portable1Inputs */

const en_x64portable1 = /** @type {(inputs: X64portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64-bit portable`)
};

const fr_x64portable1 = /** @type {(inputs: X64portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Portable 64 bits`)
};

const ja_x64portable1 = /** @type {(inputs: X64portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64ビットポータブル`)
};

const ko_x64portable1 = /** @type {(inputs: X64portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64비트 휴대용`)
};

const zh_hans1_x64portable1 = /** @type {(inputs: X64portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64位便携版`)
};

const zh_hant1_x64portable1 = /** @type {(inputs: X64portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64位元便攜版`)
};

/**
* | output |
* | --- |
* | "64-bit portable" |
*
* @param {X64portable1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const x64portable1 = /** @type {((inputs?: X64portable1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<X64portable1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_x64portable1(inputs)
	if (locale === "fr") return fr_x64portable1(inputs)
	if (locale === "ja") return ja_x64portable1(inputs)
	if (locale === "ko") return ko_x64portable1(inputs)
	if (locale === "zh-Hans") return zh_hans1_x64portable1(inputs)
	return zh_hant1_x64portable1(inputs)
});
export { x64portable1 as "x64Portable" }