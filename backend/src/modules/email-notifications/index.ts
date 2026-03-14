import { ModuleProvider, Modules } from '@medusajs/framework/utils'
import { ResendNotificationService } from './services/resend'

const services = [ResendNotificationService]

export default ModuleProvider(Modules.NOTIFICATION, {
  services,
})
