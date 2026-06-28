/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ia32setup1Inputs */

const en_ia32setup1 = /** @type {(inputs: Ia32setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32-bit`)
};

const fr_ia32setup1 = /** @type {(inputs: Ia32setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32 bits`)
};

const ja_ia32setup1 = /** @type {(inputs: Ia32setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32ビット`)
};

const ko_ia32setup1 = /** @type {(inputs: Ia32setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32비트`)
};

const zh_hans1_ia32setup1 = /** @type {(inputs: Ia32setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32位`)
};

const zh_hant1_ia32setup1 = /** @type {(inputs: Ia32setup1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`32位元`)
};

/**
* | output |
* | --- |
* | "32-bit" |
*
* @param {Ia32setup1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const ia32setup1 = /** @type {((inputs?: Ia32setup1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ia32setup1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ia32setup1(inputs)
	if (locale === "fr") return fr_ia32setup1(inputs)
	if (locale === "ja") return ja_ia32setup1(inputs)
	if (locale === "ko") return ko_ia32setup1(inputs)
	if (locale === "zh-Hans") return zh_hans1_ia32setup1(inputs)
	return zh_hant1_ia32setup1(inputs)
});
export { ia32setup1 as "ia32Setup" }