import { ModuleProvider, Modules } from "@medusajs/framework/utils"

import PaystackProviderService from "./services/paystack-provider"

const services = [PaystackProviderService]

export default ModuleProvider(Modules.PAYMENT, {
  services,
})
