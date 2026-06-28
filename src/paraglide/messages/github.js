/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} GithubInputs */

const en_github = /** @type {(inputs: GithubInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GitHub`)
};

const fr_github = /** @type {(inputs: GithubInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GitHub`)
};

const ja_github = /** @type {(inputs: GithubInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GitHub`)
};

const ko_github = /** @type {(inputs: GithubInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GitHub`)
};

const zh_hans1_github = /** @type {(inputs: GithubInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GitHub`)
};

const zh_hant1_github = /** @type {(inputs: GithubInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GitHub`)
};

/**
* | output |
* | --- |
* | "GitHub" |
*
* @param {GithubInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const github = /** @type {((inputs?: GithubInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<GithubInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_github(inputs)
	if (locale === "fr") return fr_github(inputs)
	if (locale === "ja") return ja_github(inputs)
	if (locale === "ko") return ko_github(inputs)
	if (locale === "zh-Hans") return zh_hans1_github(inputs)
	return zh_hant1_github(inputs)
});