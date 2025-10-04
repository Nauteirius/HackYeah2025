export const interpolateColor = (value: number) => {
  let t = value / 100;

  let r = Math.round(255 * (1 - t));
  let g = Math.round(255 * t);
  let b = 0;

  let hex =
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0");

  return hex;
};
