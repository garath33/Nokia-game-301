// Verze je hlavní číslo a subverze, třeba 15.1.
// Každá další feature zvedne subverzi o 1. Subverze se nevrací na začátek.
// Tatáž feature zvedne i hlavní verzi o 1. Z 15.1 je příští feature 16.2, potom 17.3.
// Zápis patří sem, do docs/verze.md, na obě stránky a do README.
export const GAME_VERSION = "15.1";

export function versionLabel() {
  return `verze ${GAME_VERSION}`;
}

export function showVersion(title) {
  const label = versionLabel();
  for (const node of document.querySelectorAll("[data-version]")) {
    node.textContent = label;
  }
  if (title) document.title = `${title}, ${label}`;
}
