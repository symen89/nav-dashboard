import historicDataJson from './historic-data.json';
import sharePricesJson from './share-prices.json';
import cci30DataJson from './cci30-data.json';
import monthEndDataJson from './month-end-data.json';

export const HISTORIC_DATA = historicDataJson;
export const SHARE_PRICES: Record<string, number> = sharePricesJson;
export const CCI30_DATA: Record<string, number> = cci30DataJson;
export const MONTH_END_DATA = monthEndDataJson;

export function getAllDates(): string[] {
  return Object.keys(NAV_DATA).sort();
}

export function getScaleFactor(): number {
  return CONFIG.scale_factor;
}
