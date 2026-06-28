/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} LinuxInputs */

const en_linux = /** @type {(inputs: LinuxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Linux`)
};

const fr_linux = /** @type {(inputs: LinuxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Linux`)
};

const ja_linux = /** @type {(inputs: LinuxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Linux`)
};

const ko_linux = /** @type {(inputs: LinuxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Linux`)
};

const zh_hans1_linux = /** @type {(inputs: LinuxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Linux`)
};

const zh_hant1_linux = /** @type {(inputs: LinuxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Linux`)
};

/**
* | output |
* | --- |
* | "Linux" |
*
* @param {LinuxInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const linux = /** @type {((inputs?: LinuxInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<LinuxInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_linux(inputs)
	if (locale === "fr") return fr_linux(inputs)
	if (locale === "ja") return ja_linux(inputs)
	if (locale === "ko") return ko_linux(inputs)
	if (locale === "zh-Hans") return zh_hans1_linux(inputs)
	return zh_hant1_linux(inputs)
});