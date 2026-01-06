"use client"

import { MapPin, Clock, Phone, Navigation } from "lucide-react"

export default function StoreLocation() {
  // Letscase Gh Google Maps embed URL
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.6161134517747!2d-0.23719872501435255!3d5.623555394357509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9906b301a3a7%3A0xc6f701e84e2fd85!2sLetsCase%20Gh!5e0!3m2!1sen!2sgh!4v1767737757252!5m2!1sen!2sgh"
  
  // Letscase Gh Google Maps directions URL
  const googleMapsDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=LetsCase+Gh"

  return (
    <div className="py-12 small:py-20 border-t border-grey-20">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="text-center mb-8 small:mb-12">
          <span className="inline-block px-3 small:px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[11px] small:text-[12px] font-semibold uppercase tracking-wider mb-3 small:mb-4">
            Visit Us
          </span>
          <h2 className="text-[24px] small:text-[36px] font-bold text-grey-90">
            Where To Find Us
          </h2>
          <p className="mt-2 small:mt-3 text-[13px] small:text-[14px] text-grey-50 max-w-[400px] small:max-w-[500px] mx-auto px-4">
            Visit our physical store in Accra for hands-on experience with our products
          </p>
        </div>

        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 medium:grid-cols-2 gap-6 small:gap-8">
            {/* Map */}
            <div className="relative rounded-[16px] small:rounded-[24px] overflow-hidden border border-grey-20 bg-grey-10 min-h-[300px] small:min-h-[400px]">
              <iframe
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "300px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Letscase Store Location"
                className="absolute inset-0"
              />
            </div>

            {/* Store Info */}
            <div className="flex flex-col justify-center">
              <div className="rounded-[16px] small:rounded-[24px] border border-grey-20 bg-gradient-to-br from-grey-5 to-white p-6 small:p-8 small:p-10">
                <h3 className="text-[22px] font-bold text-grey-90 mb-6">
                  Letscase Ghana - Main Store
                </h3>
                
                <div className="space-y-5">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/30 shrink-0">
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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/30 shrink-0">
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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/30 shrink-0">
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
