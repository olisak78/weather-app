export interface Location {
  city_code: number;
  city_name_he: string;
  city_name_en: string;
}

export interface ApiResponse {
  help: string;
  success: boolean;
  result: {
    include_total: boolean;
    limit: number;
    q: any;
    records_format: string;
    resource_id: string;
    total_estimation_threshold: null;
    records: Array<{
      _id: number;
      city_code: number;
      city_name_he: string;
      city_name_en: string;
      region_code: number;
      region_name: string;
      PIBA_bureau_code: number;
      PIBA_bureau_name: string;
      Regional_Council_code: number;
      Regional_Council_name: string;
      'rank city_name_en': number;
    }>;
  };
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'he';
