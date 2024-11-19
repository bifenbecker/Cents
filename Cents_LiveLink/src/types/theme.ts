export interface ITheme {
  id: number | null;
  businessName: string;
  businessId: number | null;
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
  normalFont: string;
  boldFont: string;
  active: boolean | null;
}
