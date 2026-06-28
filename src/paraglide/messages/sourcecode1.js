/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Sourcecode1Inputs */

const en_sourcecode1 = /** @type {(inputs: Sourcecode1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Source code`)
};

const fr_sourcecode1 = /** @type {(inputs: Sourcecode1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Code source`)
};

const ja_sourcecode1 = /** @type {(inputs: Sourcecode1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ソースコード`)
};

const ko_sourcecode1 = /** @type {(inputs: Sourcecode1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`소스코드`)
};

const zh_hans1_sourcecode1 = /** @type {(inputs: Sourcecode1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`源代码`)
};

const zh_hant1_sourcecode1 = /** @type {(inputs: Sourcecode1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`源代碼`)
};

/**
* | output |
* | --- |
* | "Source code" |
*
* @param {Sourcecode1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const sourcecode1 = /** @type {((inputs?: Sourcecode1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Sourcecode1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_sourcecode1(inputs)
	if (locale === "fr") return fr_sourcecode1(inputs)
	if (locale === "ja") return ja_sourcecode1(inputs)
	if (locale === "ko") return ko_sourcecode1(inputs)
	if (locale === "zh-Hans") return zh_hans1_sourcecode1(inputs)
	return zh_hant1_sourcecode1(inputs)
});
export { sourcecode1 as "sourceCode" }