/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Oldversions1Inputs */

const en_oldversions1 = /** @type {(inputs: Oldversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Old versions`)
};

const fr_oldversions1 = /** @type {(inputs: Oldversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Anciennes versions`)
};

const ja_oldversions1 = /** @type {(inputs: Oldversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`旧版`)
};

const ko_oldversions1 = /** @type {(inputs: Oldversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`오래된 버전`)
};

const zh_hans1_oldversions1 = /** @type {(inputs: Oldversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`历史版本`)
};

const zh_hant1_oldversions1 = /** @type {(inputs: Oldversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`歷史版本`)
};

/**
* | output |
* | --- |
* | "Old versions" |
*
* @param {Oldversions1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const oldversions1 = /** @type {((inputs?: Oldversions1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Oldversions1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_oldversions1(inputs)
	if (locale === "fr") return fr_oldversions1(inputs)
	if (locale === "ja") return ja_oldversions1(inputs)
	if (locale === "ko") return ko_oldversions1(inputs)
	if (locale === "zh-Hans") return zh_hans1_oldversions1(inputs)
	return zh_hant1_oldversions1(inputs)
});
export { oldversions1 as "oldVersions" }