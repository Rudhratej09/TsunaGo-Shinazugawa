// Mercator projection calibrated to the @svg-maps/india viewBox (0 0 612 696).
// Calibrated on India's extreme points; checked against Delhi, Mumbai, Chennai and Kolkata.
const LON0 = 68.18
const LON1 = 97.4
const LAT_TOP = 37.08
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
const SX = 612 / (LON1 - LON0)
const SY = (SX * 180) / Math.PI

export function project(lon, lat) {
  return [(lon - LON0) * SX, (merc(LAT_TOP) - merc(lat)) * SY]
}

export const STATE_NAMES = {
  an: 'Andaman & Nicobar', ap: 'Andhra Pradesh', ar: 'Arunachal Pradesh', as: 'Assam', br: 'Bihar',
  ch: 'Chandigarh', ct: 'Chhattisgarh', dn: 'Dadra & Nagar Haveli', dd: 'Daman & Diu', dl: 'Delhi',
  ga: 'Goa', gj: 'Gujarat', hr: 'Haryana', hp: 'Himachal Pradesh', jk: 'Jammu & Kashmir', jh: 'Jharkhand',
  ka: 'Karnataka', kl: 'Kerala', ld: 'Lakshadweep', mp: 'Madhya Pradesh', mh: 'Maharashtra', mn: 'Manipur',
  ml: 'Meghalaya', mz: 'Mizoram', nl: 'Nagaland', or: 'Odisha', py: 'Puducherry', pb: 'Punjab',
  rj: 'Rajasthan', sk: 'Sikkim', tn: 'Tamil Nadu', tg: 'Telangana', tr: 'Tripura', up: 'Uttar Pradesh',
  ut: 'Uttarakhand', wb: 'West Bengal',
}
