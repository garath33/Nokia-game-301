// Jediné číslo verze. Zvedni ho o 1 při každé změně hry a zapiš docs/verze.md.
export const GAME_VERSION = 15;

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
