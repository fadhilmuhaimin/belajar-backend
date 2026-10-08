// Tema Shiki berbasis CSS custom property: warna sintaks diisi tema.css (token), bukan nilai tetap di HTML.
import { createCssVariablesTheme } from "shiki";
export const temaShiki = createCssVariablesTheme({ name: "css-variables", variablePrefix: "--shiki-", variableDefaults: {}, fontStyle: true });
