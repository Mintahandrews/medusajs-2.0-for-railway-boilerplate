import { ModuleProvider, Modules } from '@medusajs/framework/utils'
import { SmsonlineghNotificationService } from './services/smsonlinegh'

const services = [SmsonlineghNotificationService]

export default ModuleProvider(Modules.NOTIFICATION, {
  services,
})
