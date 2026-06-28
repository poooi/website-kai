/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Armportable1Inputs */

const en_armportable1 = /** @type {(inputs: Armportable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM portable`)
};

const fr_armportable1 = /** @type {(inputs: Armportable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Portable ARM`)
};

const ja_armportable1 = /** @type {(inputs: Armportable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARMポータブル`)
};

const ko_armportable1 = /** @type {(inputs: Armportable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM 포터블`)
};

const zh_hans1_armportable1 = /** @type {(inputs: Armportable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM便携版`)
};

const zh_hant1_armportable1 = /** @type {(inputs: Armportable1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ARM便攜版`)
};

/**
* | output |
* | --- |
* | "ARM portable" |
*
* @param {Armportable1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const armportable1 = /** @type {((inputs?: Armportable1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Armportable1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_armportable1(inputs)
	if (locale === "fr") return fr_armportable1(inputs)
	if (locale === "ja") return ja_armportable1(inputs)
	if (locale === "ko") return ko_armportable1(inputs)
	if (locale === "zh-Hans") return zh_hans1_armportable1(inputs)
	return zh_hant1_armportable1(inputs)
});
export { armportable1 as "armPortable" }