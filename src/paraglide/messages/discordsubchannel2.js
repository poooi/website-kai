/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Discordsubchannel2Inputs */

const en_discordsubchannel2 = /** @type {(inputs: Discordsubchannel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Discord`)
};

const fr_discordsubchannel2 = /** @type {(inputs: Discordsubchannel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Discord`)
};

const ja_discordsubchannel2 = /** @type {(inputs: Discordsubchannel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Discord チャンネル`)
};

const ko_discordsubchannel2 = /** @type {(inputs: Discordsubchannel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`디스코드 채널`)
};

const zh_hans1_discordsubchannel2 = /** @type {(inputs: Discordsubchannel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Discord 频道`)
};

const zh_hant1_discordsubchannel2 = /** @type {(inputs: Discordsubchannel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Discord 頻道`)
};

/**
* | output |
* | --- |
* | "Discord" |
*
* @param {Discordsubchannel2Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const discordsubchannel2 = /** @type {((inputs?: Discordsubchannel2Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Discordsubchannel2Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_discordsubchannel2(inputs)
	if (locale === "fr") return fr_discordsubchannel2(inputs)
	if (locale === "ja") return ja_discordsubchannel2(inputs)
	if (locale === "ko") return ko_discordsubchannel2(inputs)
	if (locale === "zh-Hans") return zh_hans1_discordsubchannel2(inputs)
	return zh_hant1_discordsubchannel2(inputs)
});
export { discordsubchannel2 as "discordSubChannel" }