/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Closedialog1Inputs */

const en_closedialog1 = /** @type {(inputs: Closedialog1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close dialog`)
};

const fr_closedialog1 = /** @type {(inputs: Closedialog1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fermer le dialogue`)
};

const ja_closedialog1 = /** @type {(inputs: Closedialog1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ダイアログを閉じる`)
};

const ko_closedialog1 = /** @type {(inputs: Closedialog1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`창 닫기`)
};

const zh_hans1_closedialog1 = /** @type {(inputs: Closedialog1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`关闭弹出框`)
};

const zh_hant1_closedialog1 = /** @type {(inputs: Closedialog1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`關閉彈出框`)
};

/**
* | output |
* | --- |
* | "Close dialog" |
*
* @param {Closedialog1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const closedialog1 = /** @type {((inputs?: Closedialog1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Closedialog1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_closedialog1(inputs)
	if (locale === "fr") return fr_closedialog1(inputs)
	if (locale === "ja") return ja_closedialog1(inputs)
	if (locale === "ko") return ko_closedialog1(inputs)
	if (locale === "zh-Hans") return zh_hans1_closedialog1(inputs)
	return zh_hant1_closedialog1(inputs)
});
export { closedialog1 as "closeDialog" }