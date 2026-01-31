import navDataJson from './nav-data.json';
import sharePricesJson from './share-prices.json';
import cci30DataJson from './cci30-data.json';
import configJson from './config.json';

export const NAV_DATA: Record<string, number> = navDataJson;
export const SHARE_PRICES: Record<string, number> = sharePricesJson;
export const CCI30_DATA: Record<string, number> = cci30DataJson;
export const CONFIG = configJson;

export function getAllDates(): string[] {
  return Object.keys(NAV_DATA).sort();
}

export function getScaleFactor(): number {
  return CONFIG.scale_factor;
}
