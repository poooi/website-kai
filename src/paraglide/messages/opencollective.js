/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} OpencollectiveInputs */

const en_opencollective = /** @type {(inputs: OpencollectiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OpenCollective`)
};

const fr_opencollective = /** @type {(inputs: OpencollectiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OpenCollective`)
};

const ja_opencollective = /** @type {(inputs: OpencollectiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OpenCollective`)
};

const ko_opencollective = /** @type {(inputs: OpencollectiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OpenCollective`)
};

const zh_hans1_opencollective = /** @type {(inputs: OpencollectiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OpenCollective `)
};

const zh_hant1_opencollective = /** @type {(inputs: OpencollectiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OpenCollective`)
};

/**
* | output |
* | --- |
* | "OpenCollective" |
*
* @param {OpencollectiveInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const opencollective = /** @type {((inputs?: OpencollectiveInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<OpencollectiveInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_opencollective(inputs)
	if (locale === "fr") return fr_opencollective(inputs)
	if (locale === "ja") return ja_opencollective(inputs)
	if (locale === "ko") return ko_opencollective(inputs)
	if (locale === "zh-Hans") return zh_hans1_opencollective(inputs)
	return zh_hant1_opencollective(inputs)
});