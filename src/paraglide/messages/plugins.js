/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} PluginsInputs */

const en_plugins = /** @type {(inputs: PluginsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plugins`)
};

const fr_plugins = /** @type {(inputs: PluginsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plugins`)
};

const ja_plugins = /** @type {(inputs: PluginsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`拡張機能一覧`)
};

const ko_plugins = /** @type {(inputs: PluginsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`플러그인`)
};

const zh_hans1_plugins = /** @type {(inputs: PluginsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`插件列表`)
};

const zh_hant1_plugins = /** @type {(inputs: PluginsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`擴展列表`)
};

/**
* | output |
* | --- |
* | "Plugins" |
*
* @param {PluginsInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const plugins = /** @type {((inputs?: PluginsInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<PluginsInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_plugins(inputs)
	if (locale === "fr") return fr_plugins(inputs)
	if (locale === "ja") return ja_plugins(inputs)
	if (locale === "ko") return ko_plugins(inputs)
	if (locale === "zh-Hans") return zh_hans1_plugins(inputs)
	return zh_hant1_plugins(inputs)
});