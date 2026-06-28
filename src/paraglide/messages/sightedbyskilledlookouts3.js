/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Sightedbyskilledlookouts3Inputs */

const en_sightedbyskilledlookouts3 = /** @type {(inputs: Sightedbyskilledlookouts3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sighted by skilled lookouts:`)
};

const fr_sightedbyskilledlookouts3 = /** @type {(inputs: Sightedbyskilledlookouts3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Repéré par des guetteurs qualifiés :`)
};

const ja_sightedbyskilledlookouts3 = /** @type {(inputs: Sightedbyskilledlookouts3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`熟練見張員が観察した：`)
};

const ko_sightedbyskilledlookouts3 = /** @type {(inputs: Sightedbyskilledlookouts3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`숙련된 견장원이 발견했습니다：`)
};

const zh_hans1_sightedbyskilledlookouts3 = /** @type {(inputs: Sightedbyskilledlookouts3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`熟练见张员观察到了：`)
};

const zh_hant1_sightedbyskilledlookouts3 = /** @type {(inputs: Sightedbyskilledlookouts3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`熟練見張員觀察到了：`)
};

/**
* | output |
* | --- |
* | "Sighted by skilled lookouts:" |
*
* @param {Sightedbyskilledlookouts3Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const sightedbyskilledlookouts3 = /** @type {((inputs?: Sightedbyskilledlookouts3Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Sightedbyskilledlookouts3Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_sightedbyskilledlookouts3(inputs)
	if (locale === "fr") return fr_sightedbyskilledlookouts3(inputs)
	if (locale === "ja") return ja_sightedbyskilledlookouts3(inputs)
	if (locale === "ko") return ko_sightedbyskilledlookouts3(inputs)
	if (locale === "zh-Hans") return zh_hans1_sightedbyskilledlookouts3(inputs)
	return zh_hant1_sightedbyskilledlookouts3(inputs)
});
export { sightedbyskilledlookouts3 as "sightedBySkilledLookouts" }