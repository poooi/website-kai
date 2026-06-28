/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} OptionsInputs */

const en_options = /** @type {(inputs: OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Options`)
};

const fr_options = /** @type {(inputs: OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Possibilités`)
};

const ja_options = /** @type {(inputs: OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`オプション`)
};

const ko_options = /** @type {(inputs: OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`옵션`)
};

const zh_hans1_options = /** @type {(inputs: OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`选项`)
};

const zh_hant1_options = /** @type {(inputs: OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`選項`)
};

/**
* | output |
* | --- |
* | "Options" |
*
* @param {OptionsInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const options = /** @type {((inputs?: OptionsInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<OptionsInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_options(inputs)
	if (locale === "fr") return fr_options(inputs)
	if (locale === "ja") return ja_options(inputs)
	if (locale === "ko") return ko_options(inputs)
	if (locale === "zh-Hans") return zh_hans1_options(inputs)
	return zh_hant1_options(inputs)
});