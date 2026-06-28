/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} LilywhiteInputs */

const en_lilywhite = /** @type {(inputs: LilywhiteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lilywhite`)
};

const fr_lilywhite = /** @type {(inputs: LilywhiteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lilywhite`)
};

const ja_lilywhite = /** @type {(inputs: LilywhiteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`リリーホワイト`)
};

const ko_lilywhite = /** @type {(inputs: LilywhiteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`릴리화이트`)
};

const zh_hans1_lilywhite = /** @type {(inputs: LilywhiteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`莉莉白`)
};

const zh_hant1_lilywhite = /** @type {(inputs: LilywhiteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`莉莉白`)
};

/**
* | output |
* | --- |
* | "Lilywhite" |
*
* @param {LilywhiteInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const lilywhite = /** @type {((inputs?: LilywhiteInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<LilywhiteInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_lilywhite(inputs)
	if (locale === "fr") return fr_lilywhite(inputs)
	if (locale === "ja") return ja_lilywhite(inputs)
	if (locale === "ko") return ko_lilywhite(inputs)
	if (locale === "zh-Hans") return zh_hans1_lilywhite(inputs)
	return zh_hant1_lilywhite(inputs)
});