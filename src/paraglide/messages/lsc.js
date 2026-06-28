/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} LscInputs */

const en_lsc = /** @type {(inputs: LscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Large Scale Constructing...`)
};

const fr_lsc = /** @type {(inputs: LscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Construction à grande échelle...`)
};

const ja_lsc = /** @type {(inputs: LscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`大型建造中`)
};

const ko_lsc = /** @type {(inputs: LscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`대형함 건조 중...`)
};

const zh_hans1_lsc = /** @type {(inputs: LscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`大型建造中`)
};

const zh_hant1_lsc = /** @type {(inputs: LscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`大型建造中`)
};

/**
* | output |
* | --- |
* | "Large Scale Constructing..." |
*
* @param {LscInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const lsc = /** @type {((inputs?: LscInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<LscInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_lsc(inputs)
	if (locale === "fr") return fr_lsc(inputs)
	if (locale === "ja") return ja_lsc(inputs)
	if (locale === "ko") return ko_lsc(inputs)
	if (locale === "zh-Hans") return zh_hans1_lsc(inputs)
	return zh_hant1_lsc(inputs)
});