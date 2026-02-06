import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"
import { POS_MODULE } from "../modules/pos"
import PosModuleService from "../modules/pos/service"
import { ARONIUM_POS_ENABLED } from "../lib/constants"

/**
 * Subscriber: order-pos-sync
 * When an order is placed, queue it for POS sync if the POS module is enabled.
 */
export default async function orderPosSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  if (!ARONIUM_POS_ENABLED) return

  try {
    const posService: PosModuleService = container.resolve(POS_MODULE)
    const orderService: IOrderModuleService = container.resolve(Modules.ORDER)

    const order = await orderService.retrieveOrder(data.id, {
      relations: ["items", "summary"],
    })

    const existing = await posService.getOrderSyncByOrderId(order.id)
    if (existing) return

    await posService.createOrderSync({
      medusa_order_id: order.id,
      total_amount: (order as any).summary?.current_order_total ?? 0,
      currency_code: order.currency_code,
      sync_direction: "medusa_to_pos",
    })

    console.log(`[POS] Order ${order.id} queued for POS sync`)
  } catch (error) {
    console.error("[POS] Error queuing order for POS sync:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
