export interface QCInspection {
  id: string;
  code: string;
  grnId?: string;
  grnCode?: string;
  projectId: string;
  projectName: string;
  inspectionDate: string;
  inspectionType: 'Material' | 'Work';
  items: QCItem[];
  overallStatus: 'Passed' | 'Failed' | 'Conditional';
  remarks?: string;
  inspectedBy: string;
  inspectedByName?: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

export interface QCItem {
  id: string;
  description: string;
  parameter: string;
  specification: string;
  actualValue: string;
  status: 'Pass' | 'Fail' | 'Acceptable';
  remarks?: string;
}

export const qcInspections: QCInspection[] = [
  {
    id: 'qc-1',
    code: 'QC/2024/001',
    grnId: 'grn-1',
    grnCode: 'GRN/2024/001',
    projectId: 'proj-1',
    projectName: 'Skyline Towers',
    inspectionDate: '2024-01-26',
    inspectionType: 'Material',
    items: [
      {
        id: 'qci-1',
        description: 'ACC Cement 53 Grade',
        parameter: 'Compressive Strength',
        specification: '53 MPa',
        actualValue: '55 MPa',
        status: 'Pass',
      },
      {
        id: 'qci-2',
        description: 'TMT Bars 12mm',
        parameter: 'Tensile Strength',
        specification: '500 MPa',
        actualValue: '520 MPa',
        status: 'Pass',
      },
    ],
    overallStatus: 'Passed',
    remarks: 'All tests passed as per IS standards',
    inspectedBy: 'user-5',
    inspectedByName: 'QC Inspector',
    status: 'Approved',
    createdBy: 'user-5',
    createdAt: '2024-01-26T14:00:00Z',
  },
];
