import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { normalizeData } from './utils/survey.utils';
import { SurveyService } from './survey.service';
import { OutputFormat } from '../common/enum';

describe('SurveyService', () => {
  let surveyService: SurveyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurveyService],
    }).compile();

    surveyService = module.get<SurveyService>(SurveyService);
  });

  test('should throw if groupId and customStudentIds are provided together', () => {
    expect(() =>
      surveyService.exportSurveyData({
        format: OutputFormat.CSV,
        groupId: 1,
        customStudentIds: ['Stud A'],
      }),
    ).toThrow(BadRequestException);
  });

  test('should throw if groupId not found', () => {
    expect(() =>
      surveyService.exportSurveyData({
        format: OutputFormat.CSV,
        groupId: 999,
      }),
    ).toThrow('group id does not exist');
  });

  describe('filterSurveyData (private method testing)', () => {
    test('should filter survey data by student ids', () => {
      const mockData = [
        { _id: 'Stud A', name: 'Alice' },
        { _id: 'Stud B', name: 'Bob' },
        { _id: 'Stud C', name: 'Charlie' },
      ] as any[];

      const result = (surveyService as any)['filterSurveyData'](mockData, [
        'Stud A',
        'Stud B',
      ]);

      expect(result).toEqual({
        'Stud A': [{ _id: 'Stud A', name: 'Alice' }],
        'Stud B': [{ _id: 'Stud B', name: 'Bob' }],
      });
    });

    test('should not filter survey data if student ids []', () => {
      const mockData = [
        { _id: 'Stud A', name: 'Alice' },
        { _id: 'Stud B', name: 'Bob' },
        { _id: 'Stud C', name: 'Charlie' },
      ] as any[];

      const result = (surveyService as any)['filterSurveyData'](mockData, []);

      expect(result).toEqual({
        'Stud A': [{ _id: 'Stud A', name: 'Alice' }],
        'Stud B': [{ _id: 'Stud B', name: 'Bob' }],
        'Stud C': [{ _id: 'Stud C', name: 'Charlie' }],
      });
    });
  });

  describe('flattenAndMerge  (private method testing)', () => {
    test('should flatten and merge survey items by student ID', () => {
      const groupedData: Record<string, any[]> = {
        'Stud A': [
          {
            _id: 'Stud A',
            generalSection: {
              title: 'RDC 2022',
              surveyWave: 2,
              certificationStatus: 'ADMIS',
            },
            identitySection: { firstName: 'Myriam', email: 'stud.a@test.com' },
          },
          {
            _id: 'Stud A',
            generalSection: {
              title: 'RDC 2022',
              surveyWave: 4,
              certificationStatus: 'ADMIS',
            },
            identitySection: { firstName: 'Myriam', email: 'stud.a@test.com' },
            job: { jobTitle: 'Developer' },
          },
        ],
        'Stud B': [
          {
            _id: 'Stud B',
            generalSection: {
              title: 'RDC 2022',
              surveyWave: 1,
              certificationStatus: 'ADMIS',
            },
            identitySection: { firstName: 'John', email: 'stud.b@test.com' },
          },
        ],
      };

      const result = (surveyService as any)['flattenAndMerge'](groupedData);

      expect(result).toEqual([
        {
          _id: 'Stud A',
          '2._id': 'Stud A',
          '2.generalSection.title': 'RDC 2022',
          '2.generalSection.surveyWave': 2,
          '2.generalSection.certificationStatus': 'ADMIS',
          '2.identitySection.firstName': 'Myriam',
          '2.identitySection.email': 'stud.a@test.com',
          '4._id': 'Stud A',
          '4.generalSection.title': 'RDC 2022',
          '4.generalSection.surveyWave': 4,
          '4.generalSection.certificationStatus': 'ADMIS',
          '4.identitySection.firstName': 'Myriam',
          '4.identitySection.email': 'stud.a@test.com',
          '4.job.jobTitle': 'Developer',
        },
        {
          _id: 'Stud B',
          '1._id': 'Stud B',
          '1.generalSection.title': 'RDC 2022',
          '1.generalSection.surveyWave': 1,
          '1.generalSection.certificationStatus': 'ADMIS',
          '1.identitySection.firstName': 'John',
          '1.identitySection.email': 'stud.b@test.com',
        },
      ]);
    });
  });
});

describe('Utils Spec', () => {
  test('should return original value if not an array', () => {
    const result = normalizeData(null as any);
    expect(result).toBe(null);

    const result2 = normalizeData({} as any);
    expect(result2).toEqual({});
  });

  test('should return original value if array is empty', () => {
    const result = normalizeData([]);
    expect(result).toEqual([]);
  });

  test('should normalize objects with missing keys', () => {
    const input = [{ id: 1, name: 'Alice' }, { id: 2 }];
    const result = normalizeData(input);

    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: null },
    ]);
  });

  test('should normalize nested objects', () => {
    const input = [{ id: 1, profile: { age: 20 } }, { id: 2 }];
    const result = normalizeData(input);

    expect(result).toEqual([
      { id: 1, profile: { age: 20 } },
      { id: 2, profile: { age: null } },
    ]);
  });
});
