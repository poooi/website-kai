/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ version: NonNullable<unknown> }} Downloadwithversion2Inputs */

const en_downloadwithversion2 = /** @type {(inputs: Downloadwithversion2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Download ${i?.version}`)
};

const fr_downloadwithversion2 = /** @type {(inputs: Downloadwithversion2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Téléchargez ${i?.version}`)
};

const ja_downloadwithversion2 = /** @type {(inputs: Downloadwithversion2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.version} をダウンロード`)
};

const ko_downloadwithversion2 = /** @type {(inputs: Downloadwithversion2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.version} 다운로드하기`)
};

const zh_hans1_downloadwithversion2 = /** @type {(inputs: Downloadwithversion2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`下载 ${i?.version}`)
};

const zh_hant1_downloadwithversion2 = /** @type {(inputs: Downloadwithversion2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`下載 ${i?.version}`)
};

/**
* | output |
* | --- |
* | "Download {version}" |
*
* @param {Downloadwithversion2Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const downloadwithversion2 = /** @type {((inputs: Downloadwithversion2Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Downloadwithversion2Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_downloadwithversion2(inputs)
	if (locale === "fr") return fr_downloadwithversion2(inputs)
	if (locale === "ja") return ja_downloadwithversion2(inputs)
	if (locale === "ko") return ko_downloadwithversion2(inputs)
	if (locale === "zh-Hans") return zh_hans1_downloadwithversion2(inputs)
	return zh_hant1_downloadwithversion2(inputs)
});
export { downloadwithversion2 as "downloadWithVersion" }