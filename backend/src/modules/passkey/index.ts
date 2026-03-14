import PasskeyModuleService from './service'
import { Module } from '@medusajs/framework/utils'

export const PASSKEY_MODULE = 'passkeyModuleService'

export default Module(PASSKEY_MODULE, {
  service: PasskeyModuleService,
})
