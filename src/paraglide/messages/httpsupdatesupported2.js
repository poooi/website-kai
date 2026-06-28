/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Httpsupdatesupported2Inputs */

const en_httpsupdatesupported2 = /** @type {(inputs: Httpsupdatesupported2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`HTTPS game update supported!`)
};

const fr_httpsupdatesupported2 = /** @type {(inputs: Httpsupdatesupported2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mise à jour du jeu HTTPS prise en charge!`)
};

const ja_httpsupdatesupported2 = /** @type {(inputs: Httpsupdatesupported2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`HTTPS 対応ゲーム更新が支援済み！`)
};

const ko_httpsupdatesupported2 = /** @type {(inputs: Httpsupdatesupported2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`HTTPS 게임 업데이트가 지원됩니다!`)
};

const zh_hans1_httpsupdatesupported2 = /** @type {(inputs: Httpsupdatesupported2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`已支持 HTTPS 游戏更新！`)
};

const zh_hant1_httpsupdatesupported2 = /** @type {(inputs: Httpsupdatesupported2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`已支持 HTTPS 遊戲更新！`)
};

/**
* | output |
* | --- |
* | "HTTPS game update supported!" |
*
* @param {Httpsupdatesupported2Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const httpsupdatesupported2 = /** @type {((inputs?: Httpsupdatesupported2Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Httpsupdatesupported2Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_httpsupdatesupported2(inputs)
	if (locale === "fr") return fr_httpsupdatesupported2(inputs)
	if (locale === "ja") return ja_httpsupdatesupported2(inputs)
	if (locale === "ko") return ko_httpsupdatesupported2(inputs)
	if (locale === "zh-Hans") return zh_hans1_httpsupdatesupported2(inputs)
	return zh_hant1_httpsupdatesupported2(inputs)
});
export { httpsupdatesupported2 as "httpsUpdateSupported" }