import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

export default async function fixShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const regionModuleService = container.resolve(Modules.REGION);

  logger.info("Fixing shipping options...");

  // Get existing shipping options
  const existingOptions = await fulfillmentModuleService.listShippingOptions();
  
  // Delete all existing shipping options
  if (existingOptions.length > 0) {
    logger.info(`Deleting ${existingOptions.length} existing shipping options...`);
    await fulfillmentModuleService.deleteShippingOptions(
      existingOptions.map(opt => opt.id)
    );
  }

  // Get the Ghana region
  const regions = await regionModuleService.listRegions({ name: "Ghana" });
  if (!regions.length) {
    throw new Error("Ghana region not found!");
  }
  const region = regions[0];

  // Get fulfillment sets
  const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets();
  if (!fulfillmentSets.length) {
    throw new Error("No fulfillment sets found!");
  }
  const fulfillmentSet = fulfillmentSets[0];
  
  // Get service zones for the fulfillment set
  const serviceZones = await fulfillmentModuleService.listServiceZones();
  
  if (!serviceZones.length) {
    throw new Error("Fulfillment set has no service zones!");
  }

  // Get shipping profiles
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  if (!shippingProfiles.length) {
    throw new Error("No shipping profiles found!");
  }
  const shippingProfile = shippingProfiles[0];

  const serviceZone = serviceZones[0];
  logger.info(`Using service zone: ${serviceZone.id}`);
  logger.info("Creating new shipping options with prices...");

  // Create shipping options with proper prices
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "ghs",
            amount: 50,
          },
          {
            currency_code: "usd",
            amount: 3,
          },
          {
            region_id: region.id,
            amount: 50,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "ghs",
            amount: 100,
          },
          {
            currency_code: "usd",
            amount: 6,
          },
          {
            region_id: region.id,
            amount: 100,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });

  logger.info("Shipping options fixed successfully!");
  
  // Verify
  const newOptions = await fulfillmentModuleService.listShippingOptions();
  logger.info(`Created ${newOptions.length} shipping options:`);
  for (const option of newOptions) {
    logger.info(`  - ${option.name} (${option.id})`);
  }
}
