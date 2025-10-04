export interface SOPScenario {
  id: string;
  title: string;
  loanAmount: string;
  condition: string;
  action: string;
  timeline?: string;
  impact?: string;
  category: 'payment' | 'plan' | 'legal';
}

export interface DocumentInfo {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  scenarios?: SOPScenario[];
}
