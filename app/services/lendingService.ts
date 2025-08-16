import type { LendingRecord } from '~/types/lending';

export class LendingService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * 全ての貸出記録を取得
     */
    async getAllLendingRecords(): Promise<LendingRecord[]> {
        const response = await fetch(`${this.baseUrl}/api/lent-records`);

        if (!response.ok) {
            throw new Error(`Failed to fetch lending records: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * 貸出中の記録のみを取得
     */
    async getActiveLendingRecords(): Promise<LendingRecord[]> {
        const response = await fetch(`${this.baseUrl}/api/lent-records?status=active`);

        if (!response.ok) {
            throw new Error(`Failed to fetch active lending records: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * 返却済みの記録のみを取得
     */
    async getReturnedLendingRecords(): Promise<LendingRecord[]> {
        const response = await fetch(`${this.baseUrl}/api/lent-records?status=returned`);

        if (!response.ok) {
            throw new Error(`Failed to fetch returned lending records: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * 返却処理
     */
    async returnItem(recordId: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/lent-records/${recordId}/return`, {
            method: 'PUT',
        });

        if (!response.ok) {
            throw new Error(`Failed to return item: ${response.status} ${response.statusText}`);
        }
    }
}
