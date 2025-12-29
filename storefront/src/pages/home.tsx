import { Link, useLoaderData } from "@tanstack/react-router"
import { useProducts } from "@/lib/hooks/use-products"
import { Price } from "@/components/ui/price"
import { HttpTypes } from "@medusajs/types"


export default function HomePage() {
  const { countryCode, region } = useLoaderData({ from: "/$countryCode/" })

  const { data: productsData, isLoading } = useProducts({
    query_params: {
      limit: 8,
      fields: "*variants.calculated_price,+variants.inventory_quantity" as any, // casting as any to avoid strict type error if type is missing
    },
    region_id: region?.id,
  })

  // Flatten the pages for infinite query
  const products = productsData?.pages.flatMap((page) => page.products) || []

  return (
    <div className="min-h-screen bg-white">
      {/* Top Info Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="content-container py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[rgb(var(--brand-primary))]/10">
                <svg className="w-5 h-5 text-[rgb(var(--brand-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">Superior Quality</div>
                <div className="text-xs text-gray-600">Top-notch products</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[rgb(var(--brand-primary))]/10">
                <svg className="w-5 h-5 text-[rgb(var(--brand-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">Fast & Free Shipping</div>
                <div className="text-xs text-gray-60">On orders over {region?.currency_code === 'ghs' ? 'GH₵' : region?.currency_code?.toUpperCase()}200</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[rgb(var(--brand-primary))]/10">
                <svg className="w-5 h-5 text-[rgb(var(--brand-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">30-Day Returns</div>
                <div className="text-xs text-gray-600">Easy returns policy</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[rgb(var(--brand-primary))]/10">
                <svg className="w-5 h-5 text-[rgb(var(--brand-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">24/7 Support</div>
                <div className="text-xs text-gray-600">Expert assistance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            {/* Hero Section */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
                {/* Hero Text */}
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    Transform Your Tech,
                    <br />
                    <span className="text-[rgb(var(--brand-primary))]">Boost Digital Journey!</span>
                  </h1>
                  <p className="text-gray-600 text-lg">
                    From ultra-fast chargers to cutting-edge gaming accessories, find everything you need to power your devices with style and performance.
                  </p>
                  <Link to="/$countryCode/store" params={{ countryCode }} className="bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-secondary))] text-white px-8 py-3 rounded-full font-semibold text-lg transition-colors inline-flex items-center gap-2">
                    Shop Now
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>

                {/* Hero Image */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--brand-primary))]/10 to-transparent rounded-full blur-3xl"></div>
                  <img
                    src="https://cdn.mignite.app/ws/works_01KDNQPNK2PYAKCXATDG1NMSCG/generated-01KDNRV3YQ7DJ4KNSYZ0RTKQWQ-01KDNRV3YQJX76CSYW4V33B9MV.jpeg"
                    alt="Premium Smartphone"
                    className="relative z-10 w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: "shield", title: "Superior Quality", desc: "We offer the best products" },
                { icon: "truck", title: "Fast & Free Shipping", desc: `On orders over ${region?.currency_code === 'ghs' ? 'GH₵' : region?.currency_code?.toUpperCase()}200` },
                { icon: "refresh", title: "30-Day Returns", desc: "Not satisfied? Get a full refund" },
                { icon: "headset", title: "24/7 Support", desc: "Our support team is available" }
              ].map((item, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[rgb(var(--brand-primary))]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[rgb(var(--brand-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-semibold text-sm text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Best Sellers */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
                <Link
                  to="/$countryCode/store"
                  params={{ countryCode }}
                  className="text-[rgb(var(--brand-primary))] hover:text-[rgb(var(--brand-secondary))] font-semibold flex items-center gap-1 text-sm"
                >
                  See All
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {isLoading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 aspect-square rounded-xl mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </>
                ) : (
                  products.slice(0, 4).map((product) => {
                    const variant = product.variants?.[0]
                    return (
                      <Link
                        key={product.id}
                        to="/$countryCode/products/$handle"
                        params={{ countryCode, handle: product.handle }}
                        className="group block"
                      >
                        <div className="relative bg-gray-50 rounded-xl overflow-hidden aspect-square mb-3 group-hover:shadow-lg transition-shadow">
                          <img
                            src={product.thumbnail || ""}
                            alt={product.title || ""}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-medium text-sm text-gray-900 mb-1 group-hover:text-[rgb(var(--brand-primary))] transition-colors">
                          {product.title}
                        </h3>
                        {variant?.calculated_price && (
                          <Price
                            price={variant.calculated_price.calculated_amount || 0}
                            currencyCode={region?.currency_code || "ghs"}
                            className="text-[rgb(var(--brand-primary))] font-bold"
                          />
                        )}
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Best Sellers Widget */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Best Sellers</h3>
                <Link
                  to="/$countryCode/store"
                  params={{ countryCode }}
                  className="text-[rgb(var(--brand-primary))] hover:text-[rgb(var(--brand-secondary))] text-sm font-semibold flex items-center gap-1"
                >
                  See All
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {products.slice(0, 4).map((product) => {
                  const variant = product.variants?.[0]
                  return (
                    <Link
                      key={product.id}
                      to="/$countryCode/products/$handle"
                      params={{ countryCode, handle: product.handle }}
                      className="group block"
                    >
                      <div className="bg-white rounded-xl overflow-hidden aspect-square mb-2 group-hover:shadow-md transition-shadow">
                        <img
                          src={product.thumbnail || ""}
                          alt={product.title || ""}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">
                        {product.title}
                      </div>
                      {variant?.calculated_price && (
                        <Price
                          price={variant.calculated_price.calculated_amount || 0}
                          currencyCode={region?.currency_code || "ghs"}
                          className="text-[rgb(var(--brand-primary))] font-bold text-sm"
                        />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Shop By Category */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Shop By Category</h3>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: "Cases", icon: "📱" },
                  { name: "Audio", icon: "🎧" },
                  { name: "Smartwatch", icon: "⌚" },
                  { name: "Screen Protector", icon: "🛡️" },
                  { name: "Monitor", icon: "🖥️" },
                  { name: "Chargers", icon: "🔌" },
                ].map((cat, i) => (
                  <Link
                    key={i}
                    to="/$countryCode/store"
                    params={{ countryCode }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-[rgb(var(--brand-primary))]/5 transition-colors group"
                  >
                    <div className="text-3xl">{cat.icon}</div>
                    <div className="text-xs font-medium text-gray-900 text-center group-hover:text-[rgb(var(--brand-primary))] transition-colors">
                      {cat.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Banners */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold mb-1">iPhone 15 Pro Max</div>
                    <div className="text-xs opacity-90">Enjoy offers and deals on our new iPhone</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <button className="text-xs font-semibold underline hover:no-underline">
                  Shop Collection →
                </button>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold mb-1">Premium Headphone</div>
                    <div className="text-xs opacity-90">Enjoy the premium headphones to suit preferences</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <button className="text-xs font-semibold underline hover:no-underline">
                  Shop Collection →
                </button>
              </div>
            </div>

            {/* Trending Now */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Trending Now</h3>
                <Link
                  to="/$countryCode/store"
                  params={{ countryCode }}
                  className="text-[rgb(var(--brand-primary))] hover:text-[rgb(var(--brand-secondary))] text-sm font-semibold flex items-center gap-1"
                >
                  See All
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {products.slice(0, 4).map((product) => {
                  const variant = product.variants?.[0]
                  return (
                    <Link
                      key={product.id}
                      to="/$countryCode/products/$handle"
                      params={{ countryCode, handle: product.handle }}
                      className="group block"
                    >
                      <div className="bg-white rounded-xl overflow-hidden aspect-square mb-2 group-hover:shadow-md transition-shadow">
                        <img
                          src={product.thumbnail || ""}
                          alt={product.title || ""}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">
                        {product.title}
                      </div>
                      {variant?.calculated_price && (
                        <Price
                          price={variant.calculated_price.calculated_amount || 0}
                          currencyCode={region?.currency_code || "ghs"}
                          className="text-[rgb(var(--brand-primary))] font-bold text-sm"
                        />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Customer Testimonials */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900">What Our Customers Are Saying</h3>

              <div className="space-y-4">
                {[
                  {
                    name: "E. Botz Smith",
                    rating: 5,
                    text: "Fantastic quality! The phone case fits perfectly and the delivery was super fast. Highly recommend Letscase!",
                  },
                  {
                    name: "David Brown",
                    rating: 5,
                    text: "Great products and excellent customer service. Will definitely shop here again. Best prices in Accra!",
                  },
                ].map((review, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[rgb(var(--brand-primary))] text-white flex items-center justify-center text-xs font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">{review.name}</div>
                        <div className="flex gap-0.5">
                          {[...Array(review.rating)].map((_, j) => (
                            <svg key={j} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2">
                <button className="w-2 h-2 rounded-full bg-gray-900"></button>
                <button className="w-2 h-2 rounded-full bg-gray-300"></button>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] rounded-2xl p-6 text-white text-center space-y-4">
              <h3 className="text-xl font-bold">Stay Updated with the Latest Tech!</h3>
              <p className="text-sm opacity-90">
                Subscribe to our newsletter and be the first to hear about new arrivals and exclusive deals.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 rounded-full text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="bg-white text-[rgb(var(--brand-primary))] px-6 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
