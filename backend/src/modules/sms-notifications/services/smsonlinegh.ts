import { Logger, NotificationTypes } from '@medusajs/framework/types'
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils'
import { generateSmsText } from '../templates'

type InjectedDependencies = {
  logger: Logger
}

export interface SmsonlineghServiceOptions {
  api_key: string
  sender_id: string
}

interface SmsonlineghConfig {
  apiKey: string
  senderId: string
}

const API_BASE = 'https://api.smsonlinegh.com/v5'

/**
 * Notification provider for SMSOnlineGH (smsonlinegh.com).
 *
 * Sends SMS via the v5 REST API.
 * Docs: https://dev.smsonlinegh.com/docs/v5/http/rest/
 */
export class SmsonlineghNotificationService extends AbstractNotificationProviderService {
  static identifier = 'SMSONLINEGH_NOTIFICATION_SERVICE'

  protected config_: SmsonlineghConfig
  protected logger_: Logger

  constructor({ logger }: InjectedDependencies, options: SmsonlineghServiceOptions) {
    super()

    if (!options?.api_key?.trim()) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'SMSOnlineGH notification provider is missing required option `api_key`'
      )
    }

    if (!options?.sender_id?.trim()) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'SMSOnlineGH notification provider is missing required option `sender_id`'
      )
    }

    this.config_ = {
      apiKey: options.api_key,
      senderId: options.sender_id,
    }
    this.logger_ = logger
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No notification information provided')
    }

    if (notification.channel !== 'sms') {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `SMSOnlineGH provider only supports the "sms" channel (got "${notification.channel}")`
      )
    }

    const phone = notification.to?.trim()
    if (!phone) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'SMS recipient phone number is empty')
    }

    // Generate text from template
    const text = generateSmsText(notification.template, notification.data)

    // Build SMSOnlineGH v5 request body
    const body = {
      messages: [
        {
          text,
          type: 0, // 0 = non-personalised text SMS
          sender: this.config_.senderId,
          destinations: [phone],
        },
      ],
    }

    try {
      const resp = await fetch(`${API_BASE}/message/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `key ${this.config_.apiKey}`,
        },
        body: JSON.stringify(body),
      })

      const json = (await resp.json().catch(() => null)) as any

      if (!resp.ok) {
        const errMsg = json?.message || json?.error || `SMSOnlineGH API error (${resp.status})`
        throw new Error(errMsg)
      }

      // SMSOnlineGH returns handshake info + batch reference
      const batchId = json?.batchId || json?.data?.batchId || json?.handshake?.label || resp.status
      this.logger_.log(
        `Successfully sent "${notification.template}" SMS to ${phone} via SMSOnlineGH (batch: ${batchId})`
      )

      return { id: String(batchId) }
    } catch (error) {
      if (error instanceof MedusaError) throw error

      const errorMessage = (error as any)?.message ?? 'unknown error'
      this.logger_.error(
        `Failed to send "${notification.template}" SMS to ${phone} via SMSOnlineGH: ${errorMessage}`
      )
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send "${notification.template}" SMS to ${phone} via SMSOnlineGH: ${errorMessage}`
      )
    }
  }
}
