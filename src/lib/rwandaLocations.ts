export interface RwandaLocationData {
  [province: string]: {
    [district: string]: {
      [sector: string]: {
        [cell: string]: string[];
      };
    };
  };
}

import rwandaData from '../../data.json';

export class RwandaLocationService {
  private static data: RwandaLocationData = rwandaData;

  static getProvinces(): string[] {
    return Object.keys(this.data);
  }

  static getDistricts(province: string): string[] {
    if (!province || !this.data[province]) return [];
    return Object.keys(this.data[province]);
  }

  static getSectors(province: string, district: string): string[] {
    if (!province || !district || !this.data[province]?.[district]) return [];
    return Object.keys(this.data[province][district]);
  }

  static getCells(province: string, district: string, sector: string): string[] {
    if (!province || !district || !sector || !this.data[province]?.[district]?.[sector]) return [];
    return Object.keys(this.data[province][district][sector]);
  }

  static getVillages(province: string, district: string, sector: string, cell: string): string[] {
    if (!province || !district || !sector || !cell || !this.data[province]?.[district]?.[sector]?.[cell]) return [];
    return this.data[province][district][sector][cell];
  }
}