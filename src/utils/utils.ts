export function padLeadingZeros(num: number, size: number): string {
  let s = num.toString();
  while (s.length < size) s = "0" + s;
  return s;
}

export function getWindowSize() {
  const d = document,
      root = d.documentElement,
      body = d.body;
  const width = window.innerWidth || root.clientWidth || body.clientWidth,
      height = window.innerHeight || root.clientHeight || body.clientHeight;
  return { width, height };
}

export function getNow() {
  return new Date().getTime();
}