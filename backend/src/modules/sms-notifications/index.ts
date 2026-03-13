import { ModuleProviderExports } from '@medusajs/framework/types'
import { SmsonlineghNotificationService } from './services/smsonlinegh'

const services = [SmsonlineghNotificationService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
