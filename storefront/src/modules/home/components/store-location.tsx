"use client"

import { MapPin, Clock, Phone, Navigation } from "lucide-react"

export default function StoreLocation() {
  // Replace with your actual Google Maps embed URL and coordinates
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.7332776660044!2d-0.18696368523455!3d5.6037168954169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0xbed14ed8650e2dd3!2sAccra%2C%20Ghana!5e0!3m2!1sen!2sus!4v1680000000000!5m2!1sen!2sus"
  
  // Replace with your actual Google Maps directions URL
  const googleMapsDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Letscase+Ghana+Accra"

  return (
    <div className="py-16 small:py-20 border-t border-grey-20">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[12px] font-semibold uppercase tracking-wider mb-4">
            Visit Us
          </span>
          <h2 className="text-[28px] small:text-[36px] font-bold text-grey-90">
            Where To Find Us
          </h2>
          <p className="mt-3 text-[14px] text-grey-50 max-w-[500px] mx-auto">
            Visit our physical store in Accra for hands-on experience with our products
          </p>
        </div>

        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 medium:grid-cols-2 gap-8">
            {/* Map */}
            <div className="relative rounded-[24px] overflow-hidden border border-grey-20 bg-grey-10 min-h-[400px]">
              <iframe
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Letscase Store Location"
                className="absolute inset-0"
              />
            </div>

            {/* Store Info */}
            <div className="flex flex-col justify-center">
              <div className="rounded-[24px] border border-grey-20 bg-gradient-to-br from-grey-5 to-white p-8 small:p-10">
                <h3 className="text-[22px] font-bold text-grey-90 mb-6">
                  Letscase Ghana - Main Store
                </h3>
                
                <div className="space-y-5">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shrink-0">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-grey-90 mb-1">
                        Store Address
                      </div>
                      <p className="text-[14px] text-grey-50 leading-relaxed">
                        123 Tech Street, Osu<br />
                        Accra, Greater Accra Region<br />
                        Ghana
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shrink-0">
                      <Clock size={22} />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-grey-90 mb-1">
                        Opening Hours
                      </div>
                      <p className="text-[14px] text-grey-50 leading-relaxed">
                        Monday - Friday: 9:00 AM - 7:00 PM<br />
                        Saturday: 10:00 AM - 6:00 PM<br />
                        Sunday: 12:00 PM - 5:00 PM
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
                      <Phone size={22} />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-grey-90 mb-1">
                        Contact Us
                      </div>
                      <p className="text-[14px] text-grey-50 leading-relaxed">
                        Phone: +233 XX XXX XXXX<br />
                        WhatsApp: +233 XX XXX XXXX
                      </p>
                    </div>
                  </div>
                </div>

                {/* Get Directions Button */}
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 w-full h-[52px] rounded-full bg-brand text-white text-[15px] font-semibold flex items-center justify-center gap-2 transition duration-300 hover:bg-brand-dark hover:scale-[1.02]"
                >
                  <Navigation size={18} />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
