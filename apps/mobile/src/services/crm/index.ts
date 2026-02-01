// CRM Services - Export all CRM modules

export { CRMApiClient } from './CRMApiClient';
export { CRMEventQueue } from './CRMEventQueue';
export { CRMService } from './CRMService';
export {
  userToContact,
  organizationToContact,
  requestToOpportunity,
  eventToActivity,
  createCRMEvent,
  generateEventId,
} from './CRMDataMapper';
