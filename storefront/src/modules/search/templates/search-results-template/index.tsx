import { Heading, Text } from "@medusajs/ui"

import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SearchResultsTemplateProps = {
  query: string
  ids: string[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
}

const SearchResultsTemplate = ({
  query,
  ids,
  sortBy,
  page,
  countryCode,
}: SearchResultsTemplateProps) => {
  const pageNumber = page ? parseInt(page) : 1

  // When MeiliSearch returns IDs we filter by them; otherwise fall back to
  // Medusa's built-in full-text search (the `q` parameter).
  const useMedusaSearch = ids.length === 0

  return (
    <>
      <div className="flex justify-between border-b w-full py-6 px-8 small:px-14 items-center">
        <div className="flex flex-col items-start">
          <Text className="text-ui-fg-muted">Search Results for:</Text>
          <Heading>
            {decodeURI(query)}
          </Heading>
        </div>
        <LocalizedClientLink
          href="/store"
          className="txt-medium text-ui-fg-subtle hover:text-ui-fg-base"
        >
          Clear
        </LocalizedClientLink>
      </div>
      <div className="flex flex-col small:flex-row small:items-start p-6">
        <RefinementList sortBy={sortBy || "created_at"} search />
        <div className="content-container">
          <PaginatedProducts
            productsIds={useMedusaSearch ? undefined : ids}
            searchQuery={useMedusaSearch ? decodeURI(query) : undefined}
            sortBy={sortBy}
            page={pageNumber}
            countryCode={countryCode}
          />
        </div>
      </div>
    </>
  )
}

export default SearchResultsTemplate
