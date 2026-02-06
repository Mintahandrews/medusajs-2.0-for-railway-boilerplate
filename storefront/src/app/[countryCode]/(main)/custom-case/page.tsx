import { Metadata } from "next"
import CaseDesignerWrapper from "@modules/custom-case/components/case-designer-wrapper"

export const metadata: Metadata = {
  title: "Custom Case Designer | Letscase",
  description:
    "Design your own custom phone case. Choose your device, pick colors, add text or upload images.",
}

export default function CustomCasePage() {
  return <CaseDesignerWrapper />
}
