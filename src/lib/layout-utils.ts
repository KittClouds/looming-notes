export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 64,
  TOOLBAR_HEIGHT: 40,
  TITLE_AREA_HEIGHT: 88, // p-6 + input height
} as const;

export function calculateAvailableHeight(includeToolbar: boolean = true): string {
  let totalOffset = LAYOUT_CONSTANTS.HEADER_HEIGHT + LAYOUT_CONSTANTS.TITLE_AREA_HEIGHT;
  
  if (includeToolbar) {
    totalOffset += LAYOUT_CONSTANTS.TOOLBAR_HEIGHT;
  }

  return `calc(100vh - ${totalOffset}px)`;
}
