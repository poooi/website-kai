/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ site: NonNullable<unknown> }} Hostedat1Inputs */

const en_hostedat1 = /** @type {(inputs: Hostedat1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Hosted at ${i?.site}`)
};

const fr_hostedat1 = /** @type {(inputs: Hostedat1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Hébergé sur ${i?.site}`)
};

const ja_hostedat1 = /** @type {(inputs: Hostedat1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.site} でホストされています`)
};

const ko_hostedat1 = /** @type {(inputs: Hostedat1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.site}에서 호스팅 중`)
};

const zh_hans1_hostedat1 = /** @type {(inputs: Hostedat1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`托管于 ${i?.site}`)
};

const zh_hant1_hostedat1 = /** @type {(inputs: Hostedat1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`託管於 ${i?.site}`)
};

/**
* | output |
* | --- |
* | "Hosted at {site}" |
*
* @param {Hostedat1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const hostedat1 = /** @type {((inputs: Hostedat1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hostedat1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hostedat1(inputs)
	if (locale === "fr") return fr_hostedat1(inputs)
	if (locale === "ja") return ja_hostedat1(inputs)
	if (locale === "ko") return ko_hostedat1(inputs)
	if (locale === "zh-Hans") return zh_hans1_hostedat1(inputs)
	return zh_hant1_hostedat1(inputs)
});
export { hostedat1 as "hostedAt" }