import { Organization } from "./Organization";

export interface Province {
  provinceId?: number;

  provinceShortName?: string;

  provinceName?: string;

  country?: string;

  creationDate?: string;

  createdBy?: string;

  lastUpdateDate?: string;

  lastUpdatedBy?: string;

  organization?: Organization;
}
