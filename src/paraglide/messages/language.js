/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} LanguageInputs */

const en_language = /** @type {(inputs: LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`English`)
};

const fr_language = /** @type {(inputs: LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`français`)
};

const ja_language = /** @type {(inputs: LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`日本語`)
};

const ko_language = /** @type {(inputs: LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`한국어`)
};

const zh_hans1_language = /** @type {(inputs: LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`简体中文`)
};

const zh_hant1_language = /** @type {(inputs: LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`繁體中文`)
};

/**
* | output |
* | --- |
* | "English" |
*
* @param {LanguageInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const language = /** @type {((inputs?: LanguageInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<LanguageInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_language(inputs)
	if (locale === "fr") return fr_language(inputs)
	if (locale === "ja") return ja_language(inputs)
	if (locale === "ko") return ko_language(inputs)
	if (locale === "zh-Hans") return zh_hans1_language(inputs)
	return zh_hant1_language(inputs)
});