import * as runtime from "react/jsx-runtime";
import { useMemo } from "react";

function getMDXComponent(code: string) {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
}

export function useMDXComponent(code: string) {
  return useMemo(() => getMDXComponent(code), [code]);
}
