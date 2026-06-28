/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ia32portable1Inputs */

const en_ia32portable1 = /** @type {(inputs: Ia32portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32-bit portable`)
};

const fr_ia32portable1 = /** @type {(inputs: Ia32portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Portable 32 bits`)
};

const ja_ia32portable1 = /** @type {(inputs: Ia32portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32ビットポータブル`)
};

const ko_ia32portable1 = /** @type {(inputs: Ia32portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32비트 휴대용`)
};

const zh_hans1_ia32portable1 = /** @type {(inputs: Ia32portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32位便携版`)
};

const zh_hant1_ia32portable1 = /** @type {(inputs: Ia32portable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32位元便攜版`)
};

/**
* | output |
* | --- |
* | "32-bit portable" |
*
* @param {Ia32portable1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const ia32portable1 = /** @type {((inputs?: Ia32portable1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ia32portable1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ia32portable1(inputs)
	if (locale === "fr") return fr_ia32portable1(inputs)
	if (locale === "ja") return ja_ia32portable1(inputs)
	if (locale === "ko") return ko_ia32portable1(inputs)
	if (locale === "zh-Hans") return zh_hans1_ia32portable1(inputs)
	return zh_hant1_ia32portable1(inputs)
});
export { ia32portable1 as "ia32Portable" }