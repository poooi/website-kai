/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} DescriptionInputs */

const en_description = /** @type {(inputs: DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Scalable KanColle browser and tool.`)
};

const fr_description = /** @type {(inputs: DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navigateur et outil évolutif pour KanColle`)
};

const ja_description = /** @type {(inputs: DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`拡張可能な「艦隊これくしょん」ブラウザ`)
};

const ko_description = /** @type {(inputs: DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`확장 가능한 「함대 컬렉션」 브라우저`)
};

const zh_hans1_description = /** @type {(inputs: DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`可扩展的「舰队 Collection」浏览器`)
};

const zh_hant1_description = /** @type {(inputs: DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`可擴展的「艦隊 Collection」瀏覽器`)
};

/**
* | output |
* | --- |
* | "Scalable KanColle browser and tool." |
*
* @param {DescriptionInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const description = /** @type {((inputs?: DescriptionInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<DescriptionInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_description(inputs)
	if (locale === "fr") return fr_description(inputs)
	if (locale === "ja") return ja_description(inputs)
	if (locale === "ko") return ko_description(inputs)
	if (locale === "zh-Hans") return zh_hans1_description(inputs)
	return zh_hant1_description(inputs)
});