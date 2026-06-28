/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} MacosInputs */

const en_macos = /** @type {(inputs: MacosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`macOS`)
};

const fr_macos = /** @type {(inputs: MacosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`macOS`)
};

const ja_macos = /** @type {(inputs: MacosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`macOS`)
};

const ko_macos = /** @type {(inputs: MacosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`macOS`)
};

const zh_hans1_macos = /** @type {(inputs: MacosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`macOS`)
};

const zh_hant1_macos = /** @type {(inputs: MacosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`macOS`)
};

/**
* | output |
* | --- |
* | "macOS" |
*
* @param {MacosInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const macos = /** @type {((inputs?: MacosInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<MacosInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_macos(inputs)
	if (locale === "fr") return fr_macos(inputs)
	if (locale === "ja") return ja_macos(inputs)
	if (locale === "ko") return ko_macos(inputs)
	if (locale === "zh-Hans") return zh_hans1_macos(inputs)
	return zh_hant1_macos(inputs)
});