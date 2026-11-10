// Verze je hlavní číslo a dvoumístná subverze, třeba 15.02.
// Každá feature nebo úprava zvedne jen subverzi o 1: 15.03, 15.04.
// Hlavní číslo nech, dokud o novou verzi není požádáno.
// Zápis patří sem, do docs/verze.md, na obě stránky a do README.
export const GAME_VERSION = "15.02";

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
