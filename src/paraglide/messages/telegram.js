/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} TelegramInputs */

const en_telegram = /** @type {(inputs: TelegramInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telegram`)
};

const fr_telegram = /** @type {(inputs: TelegramInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telegram`)
};

const ja_telegram = /** @type {(inputs: TelegramInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telegram`)
};

const ko_telegram = /** @type {(inputs: TelegramInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telegram`)
};

const zh_hans1_telegram = /** @type {(inputs: TelegramInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telegram`)
};

const zh_hant1_telegram = /** @type {(inputs: TelegramInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telegram`)
};

/**
* | output |
* | --- |
* | "Telegram" |
*
* @param {TelegramInputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
export const telegram = /** @type {((inputs?: TelegramInputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<TelegramInputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_telegram(inputs)
	if (locale === "fr") return fr_telegram(inputs)
	if (locale === "ja") return ja_telegram(inputs)
	if (locale === "ko") return ko_telegram(inputs)
	if (locale === "zh-Hans") return zh_hans1_telegram(inputs)
	return zh_hant1_telegram(inputs)
});