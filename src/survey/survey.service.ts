import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GenerateCsvInput } from './dto/survey.dto';
import { parse } from 'json2csv';
import * as XLSX from 'xlsx';
import { OutputFormat } from 'src/common/enum';

export interface SurveyItem {
  _id: string;
  generalSection?: {
    surveyWave?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

@Injectable()
export class SurveyService {
  private data: SurveyItem[];
  private defaultGroup = [
    { id: 1, students: ['Stud A', 'Stud B'] },
    { id: 2, students: ['Stud A', 'Stud B', 'Stud C', 'Stud D', 'Stud E'] },
    { id: 3, students: ['Stud B', 'Stud C', 'Stud E'] },
  ];

  constructor() {
    // Load data dari file JSON sekali saat service dibuat
    const jsonData = JSON.parse(
      fs.readFileSync(path.resolve('./src/data/be-test-mock.json'), 'utf-8'),
    );

    // Normalize data awal
    this.data = jsonData.map((item: any) => this.normalizeData(item));
  }

  /**
   * Public API untuk ambil data berdasarkan groupId atau students
   */
  public getSurveyData(param: GenerateCsvInput): string {
    const { format, groupId, customStudentIds } = param;

    if (customStudentIds && groupId) {
      throw new BadRequestException(
        'You must provide either a groupId or customStudentIds, but not both.',
      );
    }

    let selectedStudents = customStudentIds;

    if (groupId) {
      const foundGroup = this.defaultGroup.find((g) => g.id === groupId);
      if (foundGroup) {
        selectedStudents = foundGroup.students;
      }
    }

    const filteredSurveyData = this.filterSurveyData(
      this.data,
      selectedStudents,
    );

    // Urutkan berdasarkan surveyWave
    Object.values(filteredSurveyData).forEach((arr) => {
      arr.sort(
        (a, b) =>
          (a.generalSection?.surveyWave || 0) -
          (b.generalSection?.surveyWave || 0),
      );
    });

    const surveyData = this.flattenAndMerge(filteredSurveyData);
    if (format === OutputFormat.CSV) {
      return this.exportCsvFile(surveyData);
    }
    return this.exportExcelFile(surveyData);
  }

  /** Generate CSV File */
  public exportCsvFile(surveyData: any[]): string {
    const csv = parse(surveyData);
    const base64 = Buffer.from(csv, 'utf8').toString('base64');

    return base64;
  }

  /** Generate Excel File */
  public exportExcelFile(surveyData: any[]): string {
    const worksheet = XLSX.utils.json_to_sheet(surveyData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SurveyData');

    // Generate buffer dari workbook XLSX
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    // Convert buffer ke base64 dan return
    return excelBuffer.toString('base64');
  }

  /**
   * Normalisasi nested object:
   * - Kalau { "$date": "..." } tetap dikembalikan dengan struktur sama
   * - Kalau kosong {} jadi { "$date": null }
   * - Kalau nested object tetap dirapikan
   */
  private normalizeData(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((val) => this.normalizeData(val));
    }

    if (obj && typeof obj === 'object') {
      const keys = Object.keys(obj);

      // Jika object kosong → dianggap "$date": null
      if (keys.length === 0) {
        return { $date: null };
      }

      // Jika hanya ada $date, tetap pertahankan
      if (keys.length === 1 && keys[0] === '$date') {
        return { $date: obj['$date'] ?? null };
      }

      // Kalau object biasa → normalize field dalamnya
      return Object.fromEntries(
        keys.map((key) => [key, this.normalizeData(obj[key])]),
      );
    }

    // Kalau primitive (string, number, null, boolean), langsung return
    return obj;
  }

  /**
   * Flatten nested object ke satu level dengan prefix key opsional
   */
  private flattenObject(obj: any, prefix = ''): any {
    return Object.keys(obj).reduce(
      (acc, key) => {
        const pre = prefix ? `${prefix}.` : '';
        if (
          typeof obj[key] === 'object' &&
          obj[key] !== null &&
          Object.keys(obj[key]).length > 0
        ) {
          Object.assign(acc, this.flattenObject(obj[key], pre + key));
        } else {
          acc[pre + key] = obj[key];
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  /**
   * Filter data berdasarkan daftar students
   * Jika students kosong/null → ambil semua
   */
  private filterSurveyData(
    data: SurveyItem[],
    students?: string[],
  ): Record<string, SurveyItem[]> {
    return data.reduce((acc: Record<string, SurveyItem[]>, item) => {
      if (!students || students.length === 0 || students.includes(item._id)) {
        if (!acc[item._id]) acc[item._id] = [];
        acc[item._id].push(item);
      }
      return acc;
    }, {});
  }

  /**
   * Flatten tiap student (per _id) dan merge per surveyWave
   */
  private flattenAndMerge(groupedData: Record<string, SurveyItem[]>): any[] {
    const merged: any[] = [];

    Object.entries(groupedData).forEach(([id, items]) => {
      const mergedItem: Record<string, any> = { _id: id };

      items.forEach((item) => {
        const flatItem = this.flattenObject(
          item,
          item.generalSection?.surveyWave?.toString() || '',
        );
        Object.assign(mergedItem, flatItem);
      });

      merged.push(mergedItem);
    });

    return merged;
  }
}
