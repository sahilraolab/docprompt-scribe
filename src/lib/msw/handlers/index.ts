import { authHandlers } from './auth';
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

export const handlers = [
  ...authHandlers,
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
];
