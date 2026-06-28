/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} ChibaheitInputs */

const en_chibaheit = /** @type {(inputs: ChibaheitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Chibaheit`)
};

const fr_chibaheit = /** @type {(inputs: ChibaheitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Chibaheit`)
};

const ja_chibaheit = /** @type {(inputs: ChibaheitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`チバハイト`)
};

const ko_chibaheit = /** @type {(inputs: ChibaheitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`치바하이트`)
};

const zh_hans1_chibaheit = /** @type {(inputs: ChibaheitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`吃吧黑特`)
};

const zh_hant1_chibaheit = /** @type {(inputs: ChibaheitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`吃吧黑特`)
};

/**
* | output |
* | --- |
* | "Chibaheit" |
*
* @param {ChibaheitInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const chibaheit = /** @type {((inputs?: ChibaheitInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<ChibaheitInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_chibaheit(inputs)
	if (locale === "fr") return fr_chibaheit(inputs)
	if (locale === "ja") return ja_chibaheit(inputs)
	if (locale === "ko") return ko_chibaheit(inputs)
	if (locale === "zh-Hans") return zh_hans1_chibaheit(inputs)
	return zh_hant1_chibaheit(inputs)
});