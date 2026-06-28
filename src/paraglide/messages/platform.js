/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} PlatformInputs */

const en_platform = /** @type {(inputs: PlatformInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Platform`)
};

const fr_platform = /** @type {(inputs: PlatformInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plate-forme`)
};

const ja_platform = /** @type {(inputs: PlatformInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`プラットフォーム`)
};

const ko_platform = /** @type {(inputs: PlatformInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`플랫폼`)
};

const zh_hans1_platform = /** @type {(inputs: PlatformInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`平台`)
};

const zh_hant1_platform = /** @type {(inputs: PlatformInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`平台`)
};

/**
* | output |
* | --- |
* | "Platform" |
*
* @param {PlatformInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const platform = /** @type {((inputs?: PlatformInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<PlatformInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_platform(inputs)
	if (locale === "fr") return fr_platform(inputs)
	if (locale === "ja") return ja_platform(inputs)
	if (locale === "ko") return ko_platform(inputs)
	if (locale === "zh-Hans") return zh_hans1_platform(inputs)
	return zh_hant1_platform(inputs)
});