/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} X64setup1Inputs */

const en_x64setup1 = /** @type {(inputs: X64setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64-bit`)
};

const fr_x64setup1 = /** @type {(inputs: X64setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64 bits`)
};

const ja_x64setup1 = /** @type {(inputs: X64setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64ビット`)
};

const ko_x64setup1 = /** @type {(inputs: X64setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64비트`)
};

const zh_hans1_x64setup1 = /** @type {(inputs: X64setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64位`)
};

const zh_hant1_x64setup1 = /** @type {(inputs: X64setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64位元`)
};

/**
* | output |
* | --- |
* | "64-bit" |
*
* @param {X64setup1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const x64setup1 = /** @type {((inputs?: X64setup1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<X64setup1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_x64setup1(inputs)
	if (locale === "fr") return fr_x64setup1(inputs)
	if (locale === "ja") return ja_x64setup1(inputs)
	if (locale === "ko") return ko_x64setup1(inputs)
	if (locale === "zh-Hans") return zh_hans1_x64setup1(inputs)
	return zh_hant1_x64setup1(inputs)
});
export { x64setup1 as "x64Setup" }