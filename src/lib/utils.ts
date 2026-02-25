import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value).replace('₩', '') + 'P';
}

export function getRankLabel(rank: string) {
  const ranks: Record<string, string> = {
    'PVT': '이병',
    'PFC': '일병',
    'CPL': '상병',
    'SGT': '병장',
    'SSG': '하사',
    'SFC': '중사',
    'MSG': '상사',
    'SGM': '원사',
    '2LT': '소위',
    '1LT': '중위',
    'CPT': '대위',
    'MAJ': '소령',
    'LTC': '중령',
    'COL': '대령',
  };
  return ranks[rank] || rank;
}
