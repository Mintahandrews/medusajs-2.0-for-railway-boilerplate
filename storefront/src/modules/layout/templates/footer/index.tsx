import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6)
  const { product_categories } = await getCategoriesList(0, 6)

  return (
    <footer className="border-t border-ui-border-base w-full bg-black text-white py-16">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-12 gap-x-8 items-start justify-between">
          <div className="flex flex-col gap-6 max-w-sm">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-[#0d9488] hover:text-[#0d9488]/80 uppercase text-2xl font-bold"
            >
              Letscase
            </LocalizedClientLink>
            <Text className="text-gray-400 txt-small text-sm leading-6">
              We are a residential interior design firm located in Portland. Our boutique-studio offers more than
            </Text>

            <ul className="flex gap-6 mt-4">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg></a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z" /><path d="M12 2.162c3.204 0 3.584.012 4.849.07 1.305.06 2.455.324 3.01.879.555.555.819 1.705.879 3.01.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.06 1.305-.324 2.455-.879 3.01-.555.555-1.705.819-3.01.879-1.265.058-1.645.069-4.849.069-3.205 0-3.584-.012-4.849-.069-1.305-.06-2.455-.324-3.01-.879-.555-.555-.819-1.705-.879-3.01-.058-1.265-.069-1.645-.069-4.849 0-3.205.012-3.584.069-4.849.06-1.305.324-2.455.879-3.01.555-.555 1.705-.819 3.01-.879 1.265-.058 1.645-.069 4.849-.069zm0-2.162c-3.259 0-3.667.014-4.947.072-1.358.062-2.29.352-3.048 1.11-.758.758-1.048 1.69-1.11 3.048-.058 1.28-.072 1.689-.072 4.948 0 3.259.014 3.668.072 4.948.062 1.358.352 2.29 1.11 3.048.758.758 1.69 1.048 3.048 1.11 1.28.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 1.358-.062 2.29-.352 3.048-1.11.758-.758 1.048-1.69 1.11-3.048.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.062-1.358-.352-2.29-1.11-3.048-.758-.758-1.69-1.048-3.048-1.11-1.28-.058-1.689-.072-4.948-.072zM18.666 5.334a1.08 1.08 0 1 0 0 2.161 1.08 1.08 0 0 0 0-2.161z" /></svg></a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-y-2">
            <span className="text-base font-bold text-white mb-2">Services</span>
            <ul className="flex flex-col gap-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Bonus program</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gift cards</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Credit and payment</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Service contracts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Non-cash account</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Payment</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-y-2">
            <span className="text-base font-bold text-white mb-2">Assistance to the buyer</span>
            <ul className="flex flex-col gap-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Find an order</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of delivery</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Exchange and return of goods</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Guarantee</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Frequently asked questions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of use of the site</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-y-2">
            <span className="text-base font-bold text-white mb-2">Contact</span>
            <ul className="flex flex-col gap-2 text-gray-400 text-sm">
              <li>1234 Street Name, City</li>
              <li>+1 (555) 123-4567</li>
              <li>contact@letscase.com</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
