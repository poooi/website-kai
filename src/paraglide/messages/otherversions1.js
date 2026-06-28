/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Otherversions1Inputs */

const en_otherversions1 = /** @type {(inputs: Otherversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Check the complete list`)
};

const fr_otherversions1 = /** @type {(inputs: Otherversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Consultez la liste complète`)
};

const ja_otherversions1 = /** @type {(inputs: Otherversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`完全な一覧を見る`)
};

const ko_otherversions1 = /** @type {(inputs: Otherversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`모든 버전 목록 보기`)
};

const zh_hans1_otherversions1 = /** @type {(inputs: Otherversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`浏览完整列表`)
};

const zh_hant1_otherversions1 = /** @type {(inputs: Otherversions1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`瀏覽完整列表`)
};

/**
* | output |
* | --- |
* | "Check the complete list" |
*
* @param {Otherversions1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const otherversions1 = /** @type {((inputs?: Otherversions1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Otherversions1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_otherversions1(inputs)
	if (locale === "fr") return fr_otherversions1(inputs)
	if (locale === "ja") return ja_otherversions1(inputs)
	if (locale === "ko") return ko_otherversions1(inputs)
	if (locale === "zh-Hans") return zh_hans1_otherversions1(inputs)
	return zh_hant1_otherversions1(inputs)
});
export { otherversions1 as "otherVersions" }