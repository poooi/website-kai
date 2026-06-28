/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Kancollebrowser2Inputs */

const en_kancollebrowser2 = /** @type {(inputs: Kancollebrowser2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`KanColle Browser`)
};

const fr_kancollebrowser2 = /** @type {(inputs: Kancollebrowser2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navigateur KanColle`)
};

const ja_kancollebrowser2 = /** @type {(inputs: Kancollebrowser2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`艦これ専ブラ`)
};

const ko_kancollebrowser2 = /** @type {(inputs: Kancollebrowser2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`칸콜레 브라우저`)
};

const zh_hans1_kancollebrowser2 = /** @type {(inputs: Kancollebrowser2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`舰娘专用浏览器`)
};

const zh_hant1_kancollebrowser2 = /** @type {(inputs: Kancollebrowser2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`艦娘專用瀏覽器`)
};

/**
* | output |
* | --- |
* | "KanColle Browser" |
*
* @param {Kancollebrowser2Inputs} inputs
* @param {{ locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }} options
* @returns {LocalizedString}
*/
const kancollebrowser2 = /** @type {((inputs?: Kancollebrowser2Inputs, options?: { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Kancollebrowser2Inputs, { locale?: "en" | "fr" | "ja" | "ko" | "zh-Hans" | "zh-Hant" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_kancollebrowser2(inputs)
	if (locale === "fr") return fr_kancollebrowser2(inputs)
	if (locale === "ja") return ja_kancollebrowser2(inputs)
	if (locale === "ko") return ko_kancollebrowser2(inputs)
	if (locale === "zh-Hans") return zh_hans1_kancollebrowser2(inputs)
	return zh_hant1_kancollebrowser2(inputs)
});
export { kancollebrowser2 as "kanColleBrowser" }