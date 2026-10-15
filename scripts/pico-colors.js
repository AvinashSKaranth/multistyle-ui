// Pico CSS v2 palette, step 550 (primary). Source: @picocss/pico@2 css/pico.colors.css (data only).
const p550 = {
  red: '#c52f21', pink: '#c72259', fuchsia: '#c1208b', purple: '#aa40bf', violet: '#8352c5',
  indigo: '#655cd6', blue: '#2060df', azure: '#0172ad', cyan: '#047878', jade: '#007a50',
  green: '#33790f', lime: '#577400', yellow: '#756b00', amber: '#876400', pumpkin: '#9c5900',
  orange: '#bd3c13', sand: '#6e6a60', grey: '#6a6a6a', zinc: '#646b79', slate: '#5d6b89',
};
// neutrals use their own 650 step as secondary
const p650 = { sand: '#55524a', grey: '#525252', zinc: '#4d535e', slate: '#48536b' };
const order = Object.keys(p550); // hue order; chromatic secondary = next hue (orange wraps to red)
const chroma = order.slice(0, 16);

export const picoColors = Object.fromEntries(order.map((n) => {
  const i = chroma.indexOf(n);
  return [n, { primary: p550[n], secondary: i < 0 ? p650[n] : p550[chroma[(i + 1) % chroma.length]] }];
}));
