/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} ReloadInputs */

const en_reload = /** @type {(inputs: ReloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reload`)
};

const fr_reload = /** @type {(inputs: ReloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rechargez`)
};

const ja_reload = /** @type {(inputs: ReloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`再読込`)
};

const ko_reload = /** @type {(inputs: ReloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`새로고침`)
};

const zh_hans1_reload = /** @type {(inputs: ReloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`重新载入`)
};

const zh_hant1_reload = /** @type {(inputs: ReloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`重新載入`)
};

/**
* | output |
* | --- |
* | "Reload" |
*
* @param {ReloadInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const reload = /** @type {((inputs?: ReloadInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<ReloadInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reload(inputs)
	if (locale === "fr") return fr_reload(inputs)
	if (locale === "ja") return ja_reload(inputs)
	if (locale === "ko") return ko_reload(inputs)
	if (locale === "zh-Hans") return zh_hans1_reload(inputs)
	return zh_hant1_reload(inputs)
});