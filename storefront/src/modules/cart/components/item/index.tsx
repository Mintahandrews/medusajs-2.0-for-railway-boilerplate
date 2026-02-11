"use client"

import { Table, Text, clx } from "@medusajs/ui"

import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { convertToLocale } from "@lib/util/money"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
}

const Item = ({ item, type = "full" }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { handle } = item.variant?.product ?? {}
  const meta = item.metadata as Record<string, any> | undefined
  const isCustomized = meta?.is_customized === "true"

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    const message = await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          {isCustomized && meta?.preview_image ? (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-ui-bg-subtle border border-ui-border-base">
              <img
                src={meta.preview_image}
                alt="Custom design"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Thumbnail
              thumbnail={item.variant?.product?.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          )}
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {isCustomized ? `Custom ${meta?.device_model || item.product_title}` : item.product_title}
        </Text>
        {isCustomized && (
          <div className="flex flex-wrap items-center gap-1 mt-1">
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-violet-100 text-violet-700 rounded-full">
              Custom Design
            </span>
            {meta?.case_type_label && (
              <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full">
                {meta.case_type_label} Case
              </span>
            )}
          </div>
        )}
        {!isCustomized && (
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
            >
              {/* TODO: Update this with the v2 way of managing inventory */}
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}

              <option value={1} key={1}>
                1
              </option>
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          {isCustomized && (item as any).unit_price != null ? (
            <div className="flex flex-col text-ui-fg-muted justify-center h-full">
              <span className="text-base-regular" data-testid="product-unit-price">
                {convertToLocale({
                  amount: (item as any).unit_price,
                  currency_code: (item as any).variant?.calculated_price?.currency_code || "usd",
                })}
              </span>
            </div>
          ) : (
            <LineItemUnitPrice item={item} style="tight" />
          )}
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              {isCustomized && (item as any).unit_price != null ? (
                <span className="text-base-regular">
                  {convertToLocale({
                    amount: (item as any).unit_price,
                    currency_code: (item as any).variant?.calculated_price?.currency_code || "usd",
                  })}
                </span>
              ) : (
                <LineItemUnitPrice item={item} style="tight" />
              )}
            </span>
          )}
          {isCustomized && (item as any).unit_price != null ? (
            <span className="text-base-regular" data-testid="product-price">
              {convertToLocale({
                amount: (item as any).unit_price * item.quantity,
                currency_code: (item as any).variant?.calculated_price?.currency_code || "usd",
              })}
            </span>
          ) : (
            <LineItemPrice item={item} style="tight" />
          )}
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
