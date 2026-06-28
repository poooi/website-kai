/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Telegramgrouplink2Inputs */

const en_telegramgrouplink2 = /** @type {(inputs: Telegramgrouplink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://t.me/joinchat/ENYTx0Cr6B9OxSCRKUzYUw`)
};

const fr_telegramgrouplink2 = /** @type {(inputs: Telegramgrouplink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://t.me/joinchat/ENYTx0Cr6B9OxSCRKUzYUw`)
};

const ja_telegramgrouplink2 = /** @type {(inputs: Telegramgrouplink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://t.me/joinchat/ENYTx0Cr6B9OxSCRKUzYUw`)
};

const ko_telegramgrouplink2 = /** @type {(inputs: Telegramgrouplink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://t.me/joinchat/ENYTx0Cr6B9OxSCRKUzYUw`)
};

const zh_hans1_telegramgrouplink2 = /** @type {(inputs: Telegramgrouplink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://t.me/joinchat/ENYTx0Cr6B9OxSCRKUzYUw`)
};

const zh_hant1_telegramgrouplink2 = /** @type {(inputs: Telegramgrouplink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://t.me/joinchat/ENYTx0Cr6B9OxSCRKUzYUw`)
};

/**
* | output |
* | --- |
* | "https://t.me/joinchat/ENYTx0Cr6B9OxSCRKUzYUw" |
*
* @param {Telegramgrouplink2Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const telegramgrouplink2 = /** @type {((inputs?: Telegramgrouplink2Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Telegramgrouplink2Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_telegramgrouplink2(inputs)
	if (locale === "fr") return fr_telegramgrouplink2(inputs)
	if (locale === "ja") return ja_telegramgrouplink2(inputs)
	if (locale === "ko") return ko_telegramgrouplink2(inputs)
	if (locale === "zh-Hans") return zh_hans1_telegramgrouplink2(inputs)
	return zh_hant1_telegramgrouplink2(inputs)
});
export { telegramgrouplink2 as "telegramGroupLink" }