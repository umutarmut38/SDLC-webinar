import { useEffect, useState } from "react";

const mediaQuery = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia(mediaQuery).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(mediaQuery);
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}
