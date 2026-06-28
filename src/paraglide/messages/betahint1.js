/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Betahint1Inputs */

const en_betahint1 = /** @type {(inputs: Betahint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Beta, for new features`)
};

const fr_betahint1 = /** @type {(inputs: Betahint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Beta, pour les nouvelles fonctionalités`)
};

const ja_betahint1 = /** @type {(inputs: Betahint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`開発版・新機能が欲しい方に推奨`)
};

const ko_betahint1 = /** @type {(inputs: Betahint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`새로운 기능 맛보기용 베타 버전`)
};

const zh_hans1_betahint1 = /** @type {(inputs: Betahint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`测试版，包含最新的功能`)
};

const zh_hant1_betahint1 = /** @type {(inputs: Betahint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`測試版，包含最新的功能`)
};

/**
* | output |
* | --- |
* | "Beta, for new features" |
*
* @param {Betahint1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const betahint1 = /** @type {((inputs?: Betahint1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Betahint1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_betahint1(inputs)
	if (locale === "fr") return fr_betahint1(inputs)
	if (locale === "ja") return ja_betahint1(inputs)
	if (locale === "ko") return ko_betahint1(inputs)
	if (locale === "zh-Hans") return zh_hans1_betahint1(inputs)
	return zh_hant1_betahint1(inputs)
});
export { betahint1 as "betaHint" }