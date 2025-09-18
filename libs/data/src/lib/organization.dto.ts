export interface OrganizationDto {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  path: string;
}
