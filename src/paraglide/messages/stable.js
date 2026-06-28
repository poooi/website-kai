/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} StableInputs */

const en_stable = /** @type {(inputs: StableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stable`)
};

const fr_stable = /** @type {(inputs: StableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stable`)
};

const ja_stable = /** @type {(inputs: StableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`安定版`)
};

const ko_stable = /** @type {(inputs: StableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`안정 버전`)
};

const zh_hans1_stable = /** @type {(inputs: StableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`正式版`)
};

const zh_hant1_stable = /** @type {(inputs: StableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`正式版`)
};

/**
* | output |
* | --- |
* | "Stable" |
*
* @param {StableInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const stable = /** @type {((inputs?: StableInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<StableInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_stable(inputs)
	if (locale === "fr") return fr_stable(inputs)
	if (locale === "ja") return ja_stable(inputs)
	if (locale === "ko") return ko_stable(inputs)
	if (locale === "zh-Hans") return zh_hans1_stable(inputs)
	return zh_hant1_stable(inputs)
});