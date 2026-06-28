/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Errormessage1Inputs */

const en_errormessage1 = /** @type {(inputs: Errormessage1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ah, the webpage has become 🐢. We will fix it.`)
};

const fr_errormessage1 = /** @type {(inputs: Errormessage1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ah, la page Web est devenue 🐢. Nous allons le réparer.`)
};

const ja_errormessage1 = /** @type {(inputs: Errormessage1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ああ、ウェブページは 🐢 になっています。 修正します。`)
};

const ko_errormessage1 = /** @type {(inputs: Errormessage1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`앗, 웹페이지가 🐢가 돼 버렸네요. 수복하겠습니다!`)
};

const zh_hans1_errormessage1 = /** @type {(inputs: Errormessage1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`啊啦啦，网页变成了 🐢。我们会进行修复。`)
};

const zh_hant1_errormessage1 = /** @type {(inputs: Errormessage1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`啊啦啦，網頁變成了 🐢。我們會進行修復。`)
};

/**
* | output |
* | --- |
* | "Ah, the webpage has become 🐢. We will fix it." |
*
* @param {Errormessage1Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const errormessage1 = /** @type {((inputs?: Errormessage1Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Errormessage1Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_errormessage1(inputs)
	if (locale === "fr") return fr_errormessage1(inputs)
	if (locale === "ja") return ja_errormessage1(inputs)
	if (locale === "ko") return ko_errormessage1(inputs)
	if (locale === "zh-Hans") return zh_hans1_errormessage1(inputs)
	return zh_hant1_errormessage1(inputs)
});
export { errormessage1 as "errorMessage" }