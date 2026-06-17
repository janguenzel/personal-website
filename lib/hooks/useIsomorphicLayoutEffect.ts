"use client";

import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect on the server logs a warning (it can't run before paint there).
// Use the layout effect in the browser — where we need it to run before paint to
// avoid a flash — and fall back to useEffect during SSR, which is a no-op anyway.
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
