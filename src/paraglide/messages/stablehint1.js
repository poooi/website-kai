/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Stablehint1Inputs */

const en_stablehint1 = /** @type {(inputs: Stablehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stable, for most users`)
};

const fr_stablehint1 = /** @type {(inputs: Stablehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stable, pour la plupart des utilisateurs`)
};

const ja_stablehint1 = /** @type {(inputs: Stablehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`安定版・一般利用の方に推奨`)
};

const ko_stablehint1 = /** @type {(inputs: Stablehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`일반 사용자용 안정 버전`)
};

const zh_hans1_stablehint1 = /** @type {(inputs: Stablehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`正式版，适合大部分人使用`)
};

const zh_hant1_stablehint1 = /** @type {(inputs: Stablehint1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`正式版，適合大部分人使用`)
};

/**
* | output |
* | --- |
* | "Stable, for most users" |
*
* @param {Stablehint1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const stablehint1 = /** @type {((inputs?: Stablehint1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Stablehint1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_stablehint1(inputs)
	if (locale === "fr") return fr_stablehint1(inputs)
	if (locale === "ja") return ja_stablehint1(inputs)
	if (locale === "ko") return ko_stablehint1(inputs)
	if (locale === "zh-Hans") return zh_hans1_stablehint1(inputs)
	return zh_hant1_stablehint1(inputs)
});
export { stablehint1 as "stableHint" }