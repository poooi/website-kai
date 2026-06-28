/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} X64rpm3Inputs */

const en_x64rpm3 = /** @type {(inputs: X64rpm3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64-bit RPM`)
};

const fr_x64rpm3 = /** @type {(inputs: X64rpm3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`RPM 64 bits`)
};

const ja_x64rpm3 = /** @type {(inputs: X64rpm3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64ビットRPM`)
};

const ko_x64rpm3 = /** @type {(inputs: X64rpm3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64비트 RPM`)
};

const zh_hans1_x64rpm3 = /** @type {(inputs: X64rpm3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64位RPM`)
};

const zh_hant1_x64rpm3 = /** @type {(inputs: X64rpm3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`64位元RPM`)
};

/**
* | output |
* | --- |
* | "64-bit RPM" |
*
* @param {X64rpm3Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const x64rpm3 = /** @type {((inputs?: X64rpm3Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<X64rpm3Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_x64rpm3(inputs)
	if (locale === "fr") return fr_x64rpm3(inputs)
	if (locale === "ja") return ja_x64rpm3(inputs)
	if (locale === "ko") return ko_x64rpm3(inputs)
	if (locale === "zh-Hans") return zh_hans1_x64rpm3(inputs)
	return zh_hant1_x64rpm3(inputs)
});
export { x64rpm3 as "x64RPM" }