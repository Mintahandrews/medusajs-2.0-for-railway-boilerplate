import {
  createStep,
  createWorkflow,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { POS_MODULE } from "../modules/pos"

type SyncInput = {
  order_sync_id: string
  pos_order_id: string
}

/**
 * Step: mark-order-synced
 * Marks an order sync record as successfully synced with the POS order ID
 */
const markOrderSynced = createStep(
  "mark-order-synced",
  async (input: SyncInput, { container }) => {
    const posService = container.resolve(POS_MODULE)
    const previous = await posService.updateOrderSync(input.order_sync_id, {
      pos_order_id: input.pos_order_id,
      sync_status: "synced",
    })
    return new StepResponse(previous, input)
  },
  async (input, { container }) => {
    if (!input) return
    const posService = container.resolve(POS_MODULE)
    await posService.updateOrderSync(input.order_sync_id, {
      pos_order_id: null,
      sync_status: "pending",
    })
  }
)

/**
 * Workflow: pos-sync-order
 * Called by the POS sync agent after successfully pushing an order to Aronium
 */
const posSyncOrderWorkflow = createWorkflow(
  "pos-sync-order",
  function (input: SyncInput) {
    const result = markOrderSynced(input)
    return result
  }
)

export default posSyncOrderWorkflow
