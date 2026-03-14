import { model } from '@medusajs/framework/utils'

const PasskeyCredential = model.define('passkey_credential', {
  id: model.id().primaryKey(),
  credential_id: model.text().unique(),
  public_key: model.text(),
  counter: model.number().default(0),
  transports: model.text().default('[]'),
  customer_id: model.text(),
  device_name: model.text().default('Unknown device'),
  webauthn_user_id: model.text(),
})

export default PasskeyCredential
