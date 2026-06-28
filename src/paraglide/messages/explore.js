/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} ExploreInputs */

const en_explore = /** @type {(inputs: ExploreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Explore`)
};

const fr_explore = /** @type {(inputs: ExploreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Explorer`)
};

const ja_explore = /** @type {(inputs: ExploreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`機能紹介`)
};

const ko_explore = /** @type {(inputs: ExploreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`소개`)
};

const zh_hans1_explore = /** @type {(inputs: ExploreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`功能简介`)
};

const zh_hant1_explore = /** @type {(inputs: ExploreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`功能簡介`)
};

/**
* | output |
* | --- |
* | "Explore" |
*
* @param {ExploreInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const explore = /** @type {((inputs?: ExploreInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<ExploreInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_explore(inputs)
	if (locale === "fr") return fr_explore(inputs)
	if (locale === "ja") return ja_explore(inputs)
	if (locale === "ko") return ko_explore(inputs)
	if (locale === "zh-Hans") return zh_hans1_explore(inputs)
	return zh_hant1_explore(inputs)
});