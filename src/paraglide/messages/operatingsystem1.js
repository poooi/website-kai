/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Operatingsystem1Inputs */

const en_operatingsystem1 = /** @type {(inputs: Operatingsystem1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Operating system`)
};

const fr_operatingsystem1 = /** @type {(inputs: Operatingsystem1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Système opérateur`)
};

const ja_operatingsystem1 = /** @type {(inputs: Operatingsystem1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`オペレーティングシステム`)
};

const ko_operatingsystem1 = /** @type {(inputs: Operatingsystem1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`운영 체제`)
};

const zh_hans1_operatingsystem1 = /** @type {(inputs: Operatingsystem1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`操作系统`)
};

const zh_hant1_operatingsystem1 = /** @type {(inputs: Operatingsystem1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`作業系統`)
};

/**
* | output |
* | --- |
* | "Operating system" |
*
* @param {Operatingsystem1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const operatingsystem1 = /** @type {((inputs?: Operatingsystem1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Operatingsystem1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_operatingsystem1(inputs)
	if (locale === "fr") return fr_operatingsystem1(inputs)
	if (locale === "ja") return ja_operatingsystem1(inputs)
	if (locale === "ko") return ko_operatingsystem1(inputs)
	if (locale === "zh-Hans") return zh_hans1_operatingsystem1(inputs)
	return zh_hant1_operatingsystem1(inputs)
});
export { operatingsystem1 as "operatingSystem" }