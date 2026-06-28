/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} ThemeInputs */

const en_theme = /** @type {(inputs: ThemeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Theme`)
};

const fr_theme = /** @type {(inputs: ThemeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Thème`)
};

const ja_theme = /** @type {(inputs: ThemeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`主題`)
};

const ko_theme = /** @type {(inputs: ThemeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`테마`)
};

const zh_hans1_theme = /** @type {(inputs: ThemeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`主题`)
};

const zh_hant1_theme = /** @type {(inputs: ThemeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`主題`)
};

/**
* | output |
* | --- |
* | "Theme" |
*
* @param {ThemeInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const theme = /** @type {((inputs?: ThemeInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<ThemeInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_theme(inputs)
	if (locale === "fr") return fr_theme(inputs)
	if (locale === "ja") return ja_theme(inputs)
	if (locale === "ko") return ko_theme(inputs)
	if (locale === "zh-Hans") return zh_hans1_theme(inputs)
	return zh_hant1_theme(inputs)
});