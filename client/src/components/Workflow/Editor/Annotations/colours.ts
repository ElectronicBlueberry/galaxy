import { hexToHsluv, hsluvToHex } from "hsluv";

export const colours = {
    black: "#000",
    blue: "#004cec",
    turquoise: "#00bbd9",
    green: "#008b0e",
    lime: "#68c000",
    orange: "#eb6b00",
    yellow: "#d9b600",
    red: "#d70012",
    pink: "#fb00a6",
} as const;

export type Colour = keyof typeof colours;

export const brightColours = (() => {
    const brighter: Record<string, string> = {};
    Object.entries(colours).forEach(([name, colour]) => {
        const hsluv = hexToHsluv(colour);
        let l = hsluv[2];
        l += (100 - l) / 2;
        hsluv[2] = l;
        brighter[name] = hsluvToHex(hsluv);
    });
    return brighter as Record<Colour, string>;
})();

/*
export const coloursAsCssVars = (() => {
    const cssVars: Record<string, string> = {};
    Object.entries(colours).forEach(([name, colour]) => {
        cssVars[`--colour-${name}`] = colour;
    });
    return cssVars as Record<`--colour-${Colour}`, string>;
})();

export const brightColoursAsCssVars = (() => {
    const cssVars: Record<string, string> = {};
    Object.entries(brightColours).forEach(([name, colour]) => {
        cssVars[`--colour-${name}-bright`] = colour;
    });
    return cssVars as Record<`--colour-${Colour}-bright`, string>;
})();
*/
