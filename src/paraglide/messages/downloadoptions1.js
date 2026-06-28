/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Downloadoptions1Inputs */

const en_downloadoptions1 = /** @type {(inputs: Downloadoptions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download options`)
};

const fr_downloadoptions1 = /** @type {(inputs: Downloadoptions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Options de téléchargement`)
};

const ja_downloadoptions1 = /** @type {(inputs: Downloadoptions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ダウンロードオプション`)
};

const ko_downloadoptions1 = /** @type {(inputs: Downloadoptions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`다운로드 옵션`)
};

const zh_hans1_downloadoptions1 = /** @type {(inputs: Downloadoptions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`下载其它平台版本`)
};

const zh_hant1_downloadoptions1 = /** @type {(inputs: Downloadoptions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`下載其它平臺版本`)
};

/**
* | output |
* | --- |
* | "Download options" |
*
* @param {Downloadoptions1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const downloadoptions1 = /** @type {((inputs?: Downloadoptions1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Downloadoptions1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_downloadoptions1(inputs)
	if (locale === "fr") return fr_downloadoptions1(inputs)
	if (locale === "ja") return ja_downloadoptions1(inputs)
	if (locale === "ko") return ko_downloadoptions1(inputs)
	if (locale === "zh-Hans") return zh_hans1_downloadoptions1(inputs)
	return zh_hant1_downloadoptions1(inputs)
});
export { downloadoptions1 as "downloadOptions" }