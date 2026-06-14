export const Keys = {
  BACK:   461,
  ENTER:   13,
  LEFT:    37,
  UP:      38,
  RIGHT:   39,
  DOWN:    40,
  RED:    403,
  GREEN:  404,
  YELLOW: 405,
  BLUE:   406,
} as const

export type KeyCode = (typeof Keys)[keyof typeof Keys]

export function initMagicRemote(): void {
  // Stub — Magic Remote pointer events are standard mouse events on webOS.
  // No extra init required for d-pad navigation.
}
