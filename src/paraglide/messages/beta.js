/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} BetaInputs */

const en_beta = /** @type {(inputs: BetaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Beta`)
};

const fr_beta = /** @type {(inputs: BetaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Beta`)
};

const ja_beta = /** @type {(inputs: BetaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`開発版`)
};

const ko_beta = /** @type {(inputs: BetaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`베타 버전`)
};

const zh_hans1_beta = /** @type {(inputs: BetaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`测试版`)
};

const zh_hant1_beta = /** @type {(inputs: BetaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`測試版`)
};

/**
* | output |
* | --- |
* | "Beta" |
*
* @param {BetaInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const beta = /** @type {((inputs?: BetaInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<BetaInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_beta(inputs)
	if (locale === "fr") return fr_beta(inputs)
	if (locale === "ja") return ja_beta(inputs)
	if (locale === "ko") return ko_beta(inputs)
	if (locale === "zh-Hans") return zh_hans1_beta(inputs)
	return zh_hant1_beta(inputs)
});