/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} WindowsInputs */

const en_windows = /** @type {(inputs: WindowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Windows`)
};

const fr_windows = /** @type {(inputs: WindowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Windows`)
};

const ja_windows = /** @type {(inputs: WindowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Windows`)
};

const ko_windows = /** @type {(inputs: WindowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Windows`)
};

const zh_hans1_windows = /** @type {(inputs: WindowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Windows`)
};

const zh_hant1_windows = /** @type {(inputs: WindowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Windows`)
};

/**
* | output |
* | --- |
* | "Windows" |
*
* @param {WindowsInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const windows = /** @type {((inputs?: WindowsInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<WindowsInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_windows(inputs)
	if (locale === "fr") return fr_windows(inputs)
	if (locale === "ja") return ja_windows(inputs)
	if (locale === "ko") return ko_windows(inputs)
	if (locale === "zh-Hans") return zh_hans1_windows(inputs)
	return zh_hant1_windows(inputs)
});