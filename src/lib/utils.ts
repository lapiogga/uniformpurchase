import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'decimal',
    }).format(amount) + ' P';
}

export function getRankLabel(rank: string) {
    const labels: Record<string, string> = {
        general: '장성',
        colonel: '대령',
        lt_colonel: '중령',
        major: '소령',
        captain: '대위',
        first_lt: '중위',
        second_lt: '소위',
        warrant: '준위',
        sgt_major: '원사',
        master_sgt: '상사',
        sgt: '중사',
        civil_servant: '군무원',
    };
    return labels[rank] || rank;
}

