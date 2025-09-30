import { http, HttpResponse } from 'msw';

export const settingsHandlers = [
  http.get('/api/settings/company', () => {
    return HttpResponse.json({
      id: 'company-1',
      name: 'BuildTech Construction Pvt Ltd',
      address: '123 Construction Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 22 1234 5678',
      email: 'info@buildtech.com',
      gst: '27AAAAA0000A1ZA',
      pan: 'AAAAA0000A',
      website: 'www.buildtech.com',
    });
  }),

  http.get('/api/settings/system', () => {
    return HttpResponse.json({
      id: 'sys-1',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'short',
      taxDefaults: {
        gst: 18,
        wct: 2,
        tds: 1,
      },
      approvalThresholds: {
        po: 100000,
        wo: 500000,
        payment: 50000,
      },
      slaDefaults: {
        poApproval: 48,
        grnQc: 24,
        billPayment: 72,
      },
    });
  }),
];
