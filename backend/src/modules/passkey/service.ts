import { MedusaService } from '@medusajs/framework/utils'
import PasskeyCredential from './models/passkey-credential'

class PasskeyModuleService extends MedusaService({
  PasskeyCredential,
}) {}

export default PasskeyModuleService
