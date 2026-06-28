/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} WeiboInputs */

const en_weibo = /** @type {(inputs: WeiboInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Weibo`)
};

const fr_weibo = /** @type {(inputs: WeiboInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Weibo`)
};

const ja_weibo = /** @type {(inputs: WeiboInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Weibo`)
};

const ko_weibo = /** @type {(inputs: WeiboInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Weibo`)
};

const zh_hans1_weibo = /** @type {(inputs: WeiboInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`新浪微博`)
};

const zh_hant1_weibo = /** @type {(inputs: WeiboInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`新浪微博`)
};

/**
* | output |
* | --- |
* | "Weibo" |
*
* @param {WeiboInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const weibo = /** @type {((inputs?: WeiboInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<WeiboInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_weibo(inputs)
	if (locale === "fr") return fr_weibo(inputs)
	if (locale === "ja") return ja_weibo(inputs)
	if (locale === "ko") return ko_weibo(inputs)
	if (locale === "zh-Hans") return zh_hans1_weibo(inputs)
	return zh_hant1_weibo(inputs)
});