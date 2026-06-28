/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Discordchannellink2Inputs */

const en_discordchannellink2 = /** @type {(inputs: Discordchannellink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://discordapp.com/channels/118339803660943369/367575898313981952`)
};

const fr_discordchannellink2 = /** @type {(inputs: Discordchannellink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://discordapp.com/channels/118339803660943369/367575898313981952`)
};

const ja_discordchannellink2 = /** @type {(inputs: Discordchannellink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://discordapp.com/channels/118339803660943369/367575898313981952`)
};

const ko_discordchannellink2 = /** @type {(inputs: Discordchannellink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://discordapp.com/channels/118339803660943369/367575898313981952`)
};

const zh_hans1_discordchannellink2 = /** @type {(inputs: Discordchannellink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://discordapp.com/channels/118339803660943369/367575898313981952`)
};

const zh_hant1_discordchannellink2 = /** @type {(inputs: Discordchannellink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://discordapp.com/channels/118339803660943369/367575898313981952`)
};

/**
* | output |
* | --- |
* | "https://discordapp.com/channels/118339803660943369/367575898313981952" |
*
* @param {Discordchannellink2Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const discordchannellink2 = /** @type {((inputs?: Discordchannellink2Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Discordchannellink2Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_discordchannellink2(inputs)
	if (locale === "fr") return fr_discordchannellink2(inputs)
	if (locale === "ja") return ja_discordchannellink2(inputs)
	if (locale === "ko") return ko_discordchannellink2(inputs)
	if (locale === "zh-Hans") return zh_hans1_discordchannellink2(inputs)
	return zh_hant1_discordchannellink2(inputs)
});
export { discordchannellink2 as "discordChannelLink" }