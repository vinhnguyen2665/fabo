import { VietQrDataDto, TaxCalculationResultDto } from '@fabo/types';

export class FaboApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  async generateVietQr(params: {
    bnbBin: string;
    consumerId: string;
    amount: number;
    billNumber: string;
    purpose: string;
  }): Promise<VietQrDataDto> {
    const res = await fetch(`${this.baseUrl}/payments/vietqr/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Lỗi tạo VietQR Napas');
    return res.json();
  }

  async calculateOrderTax(payload: any): Promise<TaxCalculationResultDto> {
    const res = await fetch(`${this.baseUrl}/pos/orders/preview-tax`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Lỗi tính thuế');
    return res.json();
  }
}

export const api = new FaboApiClient();
