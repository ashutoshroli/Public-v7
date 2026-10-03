import { describe, expect, it } from 'vitest';
import { parsePortalData } from './schema';
import { computeFinancials, contributorsForYear, rankedContributors, computeSummary, loanTotalWithInterest, decadeStats, journeyEntries, journeyTagline } from './derive';

describe('V6 parity: financial calculations', () => {
  const data = parsePortalData({
    users: [{ ID: 'U1', Name: 'Ravi' }, { ID: 'U2', Name: 'Material giver' }],
    collections: [
      { Year: 2026, ID: 'U1', Amount: '2100', 'Contribution Type': '1' },
      { Year: 2026, ID: 'U2', Amount: '0', 'Contribution Type': '2', Detail: 'Soop' },
      { Year: 2026, Name: 'Old table', Amount: '500', 'Is Resell': 'TRUE' }
    ],
    expenses: [{ Year: 2026, Amount: '300' }],
    loans: [{ Year: 2025, Amount: '10000', 'Intrest Rate': '2', Tenure: '12' }]
  })!;

  it('uses previous-year loans and per-month simple interest', () => {
    const fin = computeFinancials(data, 2026);
    expect(fin.collection).toBe(2100);
    expect(fin.pastLoanReturned).toBe(12400);
    expect(fin.totalBudget).toBe(14500);
    expect(fin.totalExpense).toBe(300);
    expect(fin.netSurplus).toBe(14200);
  });

  it('excludes resold rows and retains material/service contributors without money rank', () => {
    const contributors = contributorsForYear(data, 2026);
    expect(contributors.map((x) => x.name)).toContain('Ravi');
    expect(contributors.map((x) => x.name)).not.toContain('Old table');
    const ranked = rankedContributors(data, 2026);
    const material = ranked.find((x) => x.item.name === 'Material giver');
    expect(material?.rank).toBe(0);
    expect(material?.isTop).toBe(false);
    expect(computeSummary(data, 2026).totalCollected).toBe(2100);
  });

  it('handles alternate interest spelling and zero/invalid values safely', () => {
    expect(loanTotalWithInterest({ Amount: '5000', 'Interest Rate': '1.5', Tenure: '10' }).total).toBe(5750);
    expect(loanTotalWithInterest({ Amount: 'not-a-number', 'Interest Rate': 'x', Tenure: '' }).total).toBe(0);
  });
});

describe('V6 parity: journey data', () => {
  it('keeps the timeline data-driven and bilingual', () => {
    const data = parsePortalData({
      journeyEntries: [{ year: 2017, title_en: 'Start', title_hi: 'शुरुआत', content_en: 'Began', content_hi: 'शुरू हुआ' }],
      journeyTagline: { en: 'A decade of service', hi: 'सेवा का एक दशक' },
      collections: [{ Year: 2017, ID: 'U1', Amount: '1000', 'Contribution Type': '1' }]
    })!;
    expect(journeyEntries(data)[0]).toMatchObject({ year: 2017, titleEn: 'Start', titleHi: 'शुरुआत' });
    expect(journeyTagline(data)).toEqual({ en: 'A decade of service', hi: 'सेवा का एक दशक' });
    expect(decadeStats(data).years.some((y) => y.year === 2017)).toBe(true);
  });

  it('tolerates missing journey editorial data', () => {
    const data = parsePortalData({ collections: [] })!;
    expect(journeyEntries(data)).toEqual([]);
    expect(journeyTagline(data)).toEqual({ en: '', hi: '' });
  });
});
