// Swap the logo here: drop a new file into app/public/ and point `logo` at it.
// PNG/SVG with a transparent background works best; any aspect ratio is fine —
// the intro animation measures the image and flies it to the home-page slot.
export const BRAND = {
  name: 'TsunaGo',
  logo: `${import.meta.env.BASE_URL}logo.png`,
  intro: true, // set to false to skip the opening animation
}
