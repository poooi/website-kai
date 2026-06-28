/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nocontent1Inputs */

const en_nocontent1 = /** @type {(inputs: Nocontent1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We're working on it, please check later.`)
};

const fr_nocontent1 = /** @type {(inputs: Nocontent1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nous y travaillons, veuillez vérifier plus tard.`)
};

const ja_nocontent1 = /** @type {(inputs: Nocontent1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`作業中です。後で確認してください。`)
};

const ko_nocontent1 = /** @type {(inputs: Nocontent1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`현재 공사 중입니다. 다음에 다시 방문해 주세요!`)
};

const zh_hans1_nocontent1 = /** @type {(inputs: Nocontent1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`我们正在努力，请稍后再来。`)
};

const zh_hant1_nocontent1 = /** @type {(inputs: Nocontent1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`我們正在努力，請稍後再來。`)
};

/**
* | output |
* | --- |
* | "We're working on it, please check later." |
*
* @param {Nocontent1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const nocontent1 = /** @type {((inputs?: Nocontent1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nocontent1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nocontent1(inputs)
	if (locale === "fr") return fr_nocontent1(inputs)
	if (locale === "ja") return ja_nocontent1(inputs)
	if (locale === "ko") return ko_nocontent1(inputs)
	if (locale === "zh-Hans") return zh_hans1_nocontent1(inputs)
	return zh_hant1_nocontent1(inputs)
});
export { nocontent1 as "noContent" }