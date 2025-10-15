import { authHandlers } from './auth';
import { userHandlers } from './users';
import { profileHandlers } from './profile';
import { projectHandlers } from './projects';
import { supplierHandlers } from './suppliers';
import { purchaseHandlers } from './purchase';
import { contractorHandlers } from './contractors';
import { contractsHandlers } from './contracts';
import { siteHandlers } from './site';
import { accountsHandlers } from './accounts';
import { workflowHandlers } from './workflow';
import { notificationHandlers } from './notifications';
import { settingsHandlers } from './settings';
import { itemsHandlers } from './items';
import { documentsHandlers } from './documents';
import { labourRatesHandlers } from './labour-rates';
import { auditTrailHandlers } from './audit-trail';
import { materialRateHandlers } from './material-rates';
import { materialHandlers } from './materials';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...profileHandlers,
  ...projectHandlers,
  ...supplierHandlers,
  ...purchaseHandlers,
  ...contractorHandlers,
  ...contractsHandlers,
  ...siteHandlers,
  ...accountsHandlers,
  ...workflowHandlers,
  ...notificationHandlers,
  ...settingsHandlers,
  ...itemsHandlers,
  ...documentsHandlers,
  ...labourRatesHandlers,
  ...auditTrailHandlers,
  ...materialRateHandlers,
  ...materialHandlers,
];
