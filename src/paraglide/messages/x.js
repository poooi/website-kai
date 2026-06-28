/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} XInputs */

const en_x = /** @type {(inputs: XInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`X`)
};

const fr_x = /** @type {(inputs: XInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`X`)
};

const ja_x = /** @type {(inputs: XInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`X`)
};

const ko_x = /** @type {(inputs: XInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`X`)
};

const zh_hans1_x = /** @type {(inputs: XInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`X`)
};

const zh_hant1_x = /** @type {(inputs: XInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`X`)
};

/**
* | output |
* | --- |
* | "X" |
*
* @param {XInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const x = /** @type {((inputs?: XInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<XInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_x(inputs)
	if (locale === "fr") return fr_x(inputs)
	if (locale === "ja") return ja_x(inputs)
	if (locale === "ko") return ko_x(inputs)
	if (locale === "zh-Hans") return zh_hans1_x(inputs)
	return zh_hant1_x(inputs)
});