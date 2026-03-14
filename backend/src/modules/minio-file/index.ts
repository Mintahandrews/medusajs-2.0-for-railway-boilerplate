import { ModuleProvider, Modules } from '@medusajs/framework/utils'
import MinioFileProviderService from './service'

const services = [MinioFileProviderService]

export default ModuleProvider(Modules.FILE, {
  services,
})
