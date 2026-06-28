/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mobilehint1Inputs */

const en_mobilehint1 = /** @type {(inputs: Mobilehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi is designed for desktop devices, please try other mobile Apps instead.`)
};

const fr_mobilehint1 = /** @type {(inputs: Mobilehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi est conçu pour les appareils de bureau, veuillez plutôt essayer d'autres applications mobiles.`)
};

const ja_mobilehint1 = /** @type {(inputs: Mobilehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi はデスクトップデバイス向けに設計されています。代わりに他のモバイルアプリをお試しください。`)
};

const ko_mobilehint1 = /** @type {(inputs: Mobilehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi는 데스크톱 장치용으로 설계되었습니다. 대신 다른 모바일 앱을 사용해 보세요.`)
};

const zh_hans1_mobilehint1 = /** @type {(inputs: Mobilehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi 专为桌面设备设计，请尝试其他移动应用程序。`)
};

const zh_hant1_mobilehint1 = /** @type {(inputs: Mobilehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`poi 專為桌面設備設計，請嘗試其他行動應用程式。`)
};

/**
* | output |
* | --- |
* | "poi is designed for desktop devices, please try other mobile Apps instead." |
*
* @param {Mobilehint1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const mobilehint1 = /** @type {((inputs?: Mobilehint1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mobilehint1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mobilehint1(inputs)
	if (locale === "fr") return fr_mobilehint1(inputs)
	if (locale === "ja") return ja_mobilehint1(inputs)
	if (locale === "ko") return ko_mobilehint1(inputs)
	if (locale === "zh-Hans") return zh_hans1_mobilehint1(inputs)
	return zh_hant1_mobilehint1(inputs)
});
export { mobilehint1 as "mobileHint" }