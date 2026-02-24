import { describe, it, expect } from 'vitest'
import { calculateUserAnnualPoints } from '../points'

describe('calculateUserAnnualPoints', () => {
    it('should calculate base points for general rank', async () => {
        const user = {
            rank: 'general',
            enlist_date: '2020-01-01',
            retirement_date: null
        }
        const fiscalYear = 2026
        const result = await calculateUserAnnualPoints(user, fiscalYear)
        // base (1,000,000) + tenure (6 years * 5,000 = 30,000) = 1,030,000
        expect(result).toBe(1030000)
    })

    it('should calculate points with tenure for captain', async () => {
        const user = {
            rank: 'captain',
            enlist_date: '2016-01-01',
            retirement_date: null
        }
        const fiscalYear = 2026
        const result = await calculateUserAnnualPoints(user, fiscalYear)
        // base (600,000) + tenure (10 years * 5,000 = 50,000) = 650,000
        expect(result).toBe(650000)
    })

    it('should pro-rata points for retiring user', async () => {
        const user = {
            rank: 'captain',
            enlist_date: '2016-01-01',
            retirement_date: '2026-06-30' // Approx half year
        }
        const fiscalYear = 2026
        const result = await calculateUserAnnualPoints(user, fiscalYear)
        // total (650,000) * (serviceDays / 365)
        // June 30 is day 181 (approx)
        expect(result).toBeLessThan(650000)
        expect(result).toBeGreaterThan(320000)
    })
})
