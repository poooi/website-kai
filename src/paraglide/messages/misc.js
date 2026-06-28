/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} MiscInputs */

const en_misc = /** @type {(inputs: MiscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Misc`)
};

const fr_misc = /** @type {(inputs: MiscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Divers`)
};

const ja_misc = /** @type {(inputs: MiscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`その他`)
};

const ko_misc = /** @type {(inputs: MiscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`기타`)
};

const zh_hans1_misc = /** @type {(inputs: MiscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`杂项`)
};

const zh_hant1_misc = /** @type {(inputs: MiscInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`雜項`)
};

/**
* | output |
* | --- |
* | "Misc" |
*
* @param {MiscInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const misc = /** @type {((inputs?: MiscInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<MiscInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_misc(inputs)
	if (locale === "fr") return fr_misc(inputs)
	if (locale === "ja") return ja_misc(inputs)
	if (locale === "ko") return ko_misc(inputs)
	if (locale === "zh-Hans") return zh_hans1_misc(inputs)
	return zh_hant1_misc(inputs)
});