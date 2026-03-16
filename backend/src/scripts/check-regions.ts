import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function checkRegions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const regionModuleService = container.resolve(Modules.REGION);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  logger.info("Checking existing regions...");
  const regions = await regionModuleService.listRegions();
  
  for (const region of regions) {
    logger.info(`Region: ${region.name} (${region.id})`);
    logger.info(`  Currency: ${region.currency_code}`);
    logger.info(`  Countries: ${region.countries?.map(c => c.iso_2).join(', ')}`);
  }

  logger.info("\nChecking shipping options...");
  const shippingOptions = await fulfillmentModuleService.listShippingOptions();
  
  for (const option of shippingOptions) {
    logger.info(`Shipping Option: ${option.name} (${option.id})`);
    logger.info(`  Prices: ${JSON.stringify(option.prices)}`);
  }

  logger.info("\nDone checking database.");
}
