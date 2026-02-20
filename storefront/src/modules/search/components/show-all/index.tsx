import { Container, Text } from "@medusajs/ui"
import { useHits, useSearchBox } from "react-instantsearch"

import InteractiveLink from "@modules/common/components/interactive-link"

const ShowAll = () => {
  const { hits } = useHits()
  const { query } = useSearchBox()

  if (query === "") return null
  if (hits.length > 0 && hits.length <= 6) return null

  if (hits.length === 0) {
    return (
      <Container
        className="flex gap-2 justify-center h-fit py-2"
        data-testid="no-search-results-container"
      >
        <Text>No results found.</Text>
      </Container>
    )
  }

  return (
    <Container className="flex sm:flex-col small:flex-row gap-2 justify-center items-center h-fit py-4 small:py-2">
      <Text>
        Showing the first <span className="small:hidden">3</span><span className="hidden small:inline">6</span> results.
      </Text>
      <InteractiveLink href={`/results/${query}`}>View all</InteractiveLink>
    </Container>
  )
}

export default ShowAll
