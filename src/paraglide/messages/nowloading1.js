/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nowloading1Inputs */

const en_nowloading1 = /** @type {(inputs: Nowloading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Now Loading`)
};

const fr_nowloading1 = /** @type {(inputs: Nowloading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En cours de chargement`)
};

const ja_nowloading1 = /** @type {(inputs: Nowloading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`少女祈祷中`)
};

const ko_nowloading1 = /** @type {(inputs: Nowloading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`로딩중`)
};

const zh_hans1_nowloading1 = /** @type {(inputs: Nowloading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`少女祈祷中`)
};

const zh_hant1_nowloading1 = /** @type {(inputs: Nowloading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`少女祈禱中`)
};

/**
* | output |
* | --- |
* | "Now Loading" |
*
* @param {Nowloading1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const nowloading1 = /** @type {((inputs?: Nowloading1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nowloading1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nowloading1(inputs)
	if (locale === "fr") return fr_nowloading1(inputs)
	if (locale === "ja") return ja_nowloading1(inputs)
	if (locale === "ko") return ko_nowloading1(inputs)
	if (locale === "zh-Hans") return zh_hans1_nowloading1(inputs)
	return zh_hant1_nowloading1(inputs)
});
export { nowloading1 as "nowLoading" }