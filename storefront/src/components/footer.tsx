import CountrySelect from "@/components/country-select"
import { useCategories } from "@/lib/hooks/use-categories"
import { useRegions } from "@/lib/hooks/use-regions"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { Link, useLocation } from "@tanstack/react-router"

const Footer = () => {
  const location = useLocation();
  const countryCode = getCountryCodeFromPath(location.pathname);
  const baseHref = countryCode ? `/${countryCode}` : "";

  const { data: categories } = useCategories({
    fields: "name,handle",
    queryParams: {
      parent_category_id: "null",
      limit: 4,
    },
  });

  const { data: regions } = useRegions({
    fields: "id, currency_code, *countries",
  });

  return (
    <footer
      className="bg-[rgb(var(--brand-dark))] text-white w-full"
      data-testid="footer"
    >
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 py-16">
          {/* About Letscase */}
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://cdn.mignite.app/ws/works_01KDNQPNK2PYAKCXATDG1NMSCG/generated-01KDNQWP94RA3F43Q0M3NSY94C-01KDNQWP95HEQSD24VVWCFYCBM.jpeg"
                alt="Letscase"
                className="h-10 w-10 rounded-full"
              />
              <Link
                to={baseHref || "/"}
                className="text-2xl font-bold font-[family-name:var(--font-display)] hover:text-[rgb(var(--brand-primary))] transition-colors"
              >
                LETSCASE
              </Link>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Ghana's leading destination for authentic phone cases, laptop accessories, chargers, and premium tech gadgets.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://facebook.com/letscaseghana"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[rgb(var(--brand-primary))] hover:border-[rgb(var(--brand-primary))] transition-all"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://instagram.com/letscase_ghana"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[rgb(var(--brand-primary))] hover:border-[rgb(var(--brand-primary))] transition-all"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href="https://twitter.com/letscase_gh"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[rgb(var(--brand-primary))] hover:border-[rgb(var(--brand-primary))] transition-all"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-y-4">
            <h3 className="text-white text-sm font-bold uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={baseHref || "/"}
                  className="text-white/70 hover:text-[rgb(var(--brand-primary))] transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to={`${baseHref}/store`}
                  className="text-white/70 hover:text-[rgb(var(--brand-primary))] transition-colors text-sm"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  to={baseHref || "/"}
                  className="text-white/70 hover:text-[rgb(var(--brand-primary))] transition-colors text-sm"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to={baseHref || "/"}
                  className="text-white/70 hover:text-[rgb(var(--brand-primary))] transition-colors text-sm"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="flex flex-col gap-y-4">
              <h3 className="text-white text-sm font-bold uppercase tracking-wide">
                Categories
              </h3>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.handle}>
                    <Link
                      to={`${baseHref}/categories/${category.handle}`}
                      className="text-white/70 hover:text-[rgb(var(--brand-primary))] transition-colors text-sm"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Us */}
          <div className="flex flex-col gap-y-4">
            <h3 className="text-white text-sm font-bold uppercase tracking-wide">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Accra, Greater Accra Region, Ghana</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a
                  href="tel:+233XXXXXXXXX"
                  className="text-white/70 hover:text-[rgb(var(--brand-primary))] transition-colors text-sm"
                >
                  +233 XX XXX XXXX
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a
                  href="mailto:info@letscase.com"
                  className="text-white/70 hover:text-[rgb(var(--brand-primary))] transition-colors text-sm"
                >
                  info@letscase.com
                </a>
              </li>
            </ul>
            
            <div className="pt-2">
              <p className="text-xs text-white/50 mb-2">Business Hours:</p>
              <p className="text-xs text-white/70">Mon - Sat: 9:00 AM - 7:00 PM</p>
              <p className="text-xs text-white/70">Sunday: 10:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-white/50 mb-2">We Accept</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white/10 rounded text-xs text-white/70">MTN MoMo</span>
                <span className="px-3 py-1 bg-white/10 rounded text-xs text-white/70">Vodafone Cash</span>
                <span className="px-3 py-1 bg-white/10 rounded text-xs text-white/70">Visa</span>
                <span className="px-3 py-1 bg-white/10 rounded text-xs text-white/70">Mastercard</span>
              </div>
            </div>
            <CountrySelect regions={regions ?? []} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xs text-white/50">
              © {new Date().getFullYear()} Letscase Ghana. All rights reserved.
            </span>
            <div className="flex gap-6">
              <Link
                className="text-xs text-white/50 hover:text-[rgb(var(--brand-primary))] transition-colors"
                to={"/"}
              >
                Privacy Policy
              </Link>
              <Link
                className="text-xs text-white/50 hover:text-[rgb(var(--brand-primary))] transition-colors"
                to={"/"}
              >
                Terms of Service
              </Link>
              <span className="text-xs text-white/50">Made in Ghana 🇬🇭</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: {
    name: string;
    url: string;
    isExternal: boolean;
  }[];
}) => {
  return (
    <div className="flex flex-col gap-y-4">
      <h3 className="text-white text-sm font-bold uppercase tracking-wide">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.url} className="text-sm">
            {link.isExternal ? (
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-white/70 hover:text-[rgb(var(--brand-primary))] transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link
                to={link.url}
                className="text-white/70 hover:text-[rgb(var(--brand-primary))] transition-colors"
              >
                {link.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Footer;
