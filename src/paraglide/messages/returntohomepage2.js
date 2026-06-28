/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Returntohomepage2Inputs */

const en_returntohomepage2 = /** @type {(inputs: Returntohomepage2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Return to home page`)
};

const fr_returntohomepage2 = /** @type {(inputs: Returntohomepage2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retour à la page d'accueil`)
};

const ja_returntohomepage2 = /** @type {(inputs: Returntohomepage2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ホームページに戻る`)
};

const ko_returntohomepage2 = /** @type {(inputs: Returntohomepage2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`홈페이지로 돌아가기`)
};

const zh_hans1_returntohomepage2 = /** @type {(inputs: Returntohomepage2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`返回首页`)
};

const zh_hant1_returntohomepage2 = /** @type {(inputs: Returntohomepage2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`返回首頁`)
};

/**
* | output |
* | --- |
* | "Return to home page" |
*
* @param {Returntohomepage2Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const returntohomepage2 = /** @type {((inputs?: Returntohomepage2Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Returntohomepage2Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_returntohomepage2(inputs)
	if (locale === "fr") return fr_returntohomepage2(inputs)
	if (locale === "ja") return ja_returntohomepage2(inputs)
	if (locale === "ko") return ko_returntohomepage2(inputs)
	if (locale === "zh-Hans") return zh_hans1_returntohomepage2(inputs)
	return zh_hant1_returntohomepage2(inputs)
});
export { returntohomepage2 as "returnToHomepage" }