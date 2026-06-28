/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} DownloadInputs */

const en_download = /** @type {(inputs: DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download`)
};

const fr_download = /** @type {(inputs: DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Téléchargement`)
};

const ja_download = /** @type {(inputs: DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ダウンロード`)
};

const ko_download = /** @type {(inputs: DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`다운로드`)
};

const zh_hans1_download = /** @type {(inputs: DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`下载`)
};

const zh_hant1_download = /** @type {(inputs: DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`下載`)
};

/**
* | output |
* | --- |
* | "Download" |
*
* @param {DownloadInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const download = /** @type {((inputs?: DownloadInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<DownloadInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_download(inputs)
	if (locale === "fr") return fr_download(inputs)
	if (locale === "ja") return ja_download(inputs)
	if (locale === "ko") return ko_download(inputs)
	if (locale === "zh-Hans") return zh_hans1_download(inputs)
	return zh_hant1_download(inputs)
});