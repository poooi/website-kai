/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nightlybuilds1Inputs */

const en_nightlybuilds1 = /** @type {(inputs: Nightlybuilds1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nightly builds`)
};

const fr_nightlybuilds1 = /** @type {(inputs: Nightlybuilds1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Versions nocturnes`)
};

const ja_nightlybuilds1 = /** @type {(inputs: Nightlybuilds1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ナイトリービルド`)
};

const ko_nightlybuilds1 = /** @type {(inputs: Nightlybuilds1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`나이트리 빌드`)
};

const zh_hans1_nightlybuilds1 = /** @type {(inputs: Nightlybuilds1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`每夜构建`)
};

const zh_hant1_nightlybuilds1 = /** @type {(inputs: Nightlybuilds1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`每夜構建`)
};

/**
* | output |
* | --- |
* | "Nightly builds" |
*
* @param {Nightlybuilds1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const nightlybuilds1 = /** @type {((inputs?: Nightlybuilds1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nightlybuilds1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nightlybuilds1(inputs)
	if (locale === "fr") return fr_nightlybuilds1(inputs)
	if (locale === "ja") return ja_nightlybuilds1(inputs)
	if (locale === "ko") return ko_nightlybuilds1(inputs)
	if (locale === "zh-Hans") return zh_hans1_nightlybuilds1(inputs)
	return zh_hant1_nightlybuilds1(inputs)
});
export { nightlybuilds1 as "nightlyBuilds" }