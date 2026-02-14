export function decodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value).normalize("NFC");
  } catch {
    return value.normalize("NFC");
  }
}
