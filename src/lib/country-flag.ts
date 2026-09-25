export function getCountryFlag(countryCode?: string): string {
  if (!countryCode) {
    return "";
  }

  const codePoints = [...countryCode.toUpperCase()].map((char) => {
    const codePoint = char.codePointAt(0) ?? 0;
    return 127_397 + codePoint;
  });
  return String.fromCodePoint(...codePoints);
}
