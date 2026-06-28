/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Newlabel1Inputs */

const en_newlabel1 = /** @type {(inputs: Newlabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New`)
};

const fr_newlabel1 = /** @type {(inputs: Newlabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nouveau`)
};

const ja_newlabel1 = /** @type {(inputs: Newlabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`新着`)
};

const ko_newlabel1 = /** @type {(inputs: Newlabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`신규`)
};

const zh_hans1_newlabel1 = /** @type {(inputs: Newlabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`新`)
};

const zh_hant1_newlabel1 = /** @type {(inputs: Newlabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`新`)
};

/**
* | output |
* | --- |
* | "New" |
*
* @param {Newlabel1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const newlabel1 = /** @type {((inputs?: Newlabel1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Newlabel1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_newlabel1(inputs)
	if (locale === "fr") return fr_newlabel1(inputs)
	if (locale === "ja") return ja_newlabel1(inputs)
	if (locale === "ko") return ko_newlabel1(inputs)
	if (locale === "zh-Hans") return zh_hans1_newlabel1(inputs)
	return zh_hant1_newlabel1(inputs)
});
export { newlabel1 as "newLabel" }