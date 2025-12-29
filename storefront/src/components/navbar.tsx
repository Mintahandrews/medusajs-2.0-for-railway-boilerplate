import { CartDropdown } from "@/components/cart"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useCategories } from "@/lib/hooks/use-categories"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import * as NavigationMenu from "@radix-ui/react-navigation-menu"
import { Link, useLocation } from "@tanstack/react-router"

export const Navbar = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)
  const baseHref = countryCode ? `/${countryCode}` : ""

  const { data: topLevelCategories } = useCategories({
    fields: "id,name,handle,parent_category_id",
    queryParams: { parent_category_id: "null" },
  })

  const categoryLinks = [
    { id: "shop-all", name: "Shop all", to: `${baseHref}/store` },
    ...(topLevelCategories?.map((cat) => ({
      id: cat.id,
      name: cat.name,
      to: `${baseHref}/categories/${cat.handle}`,
    })) ?? []),
  ]

  return (
    <div className="sticky top-0 inset-x-0 z-40">
      {/* Top Bar */}
      <div className="bg-[rgb(var(--brand-secondary))] text-white text-xs py-2">
        <div className="content-container flex justify-center md:justify-between items-center">
          <div className="text-center md:text-left">
            Free Delivery on Orders Over GH₵200 | Same Day Delivery in Accra
          </div>
          <div className="hidden md:block">
            Call: +233 XX XXX XXXX
          </div>
        </div>
      </div>
      
      <header className="relative h-20 mx-auto border-b bg-[rgb(var(--brand-primary))] border-[rgb(var(--brand-secondary))]">
        <nav className="content-container text-sm font-medium text-white flex items-center justify-between w-full h-full">
          {/* Logo - Left Aligned */}
          <div className="flex items-center h-full">
            <Link
              to={baseHref || "/"}
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <img 
                src="https://cdn.mignite.app/ws/works_01KDNQPNK2PYAKCXATDG1NMSCG/logo-01KDNRFNPFVTRHN3HSDREA40E9.png"
                alt="Letscase Ghana"
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu.Root className="hidden lg:flex items-center h-full flex-1 justify-center">
            <NavigationMenu.List className="flex items-center gap-x-6 h-full">
              {/* Home */}
              <NavigationMenu.Item>
                <NavigationMenu.Link asChild>
                  <Link
                    to={baseHref || "/"}
                    className="text-white hover:text-white/80 transition-colors font-medium"
                  >
                    Home
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
              
              {/* Shop dropdown */}
              <NavigationMenu.Item className="h-full flex items-center">
                <NavigationMenu.Trigger className="text-white hover:text-white/80 h-full flex items-center gap-1 select-none font-medium">
                  Shop All
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="content-container py-12">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="flex flex-col gap-6">
                      <h3 className="text-[rgb(var(--brand-primary))] text-base font-bold uppercase">
                        All Categories
                      </h3>
                      <div className="flex flex-col gap-3">
                        {categoryLinks.map((link) => (
                          <NavigationMenu.Link key={link.id} asChild>
                            <Link
                              to={link.to}
                              className="text-zinc-600 hover:text-[rgb(var(--brand-primary))] text-base font-medium transition-colors"
                            >
                              {link.name}
                            </Link>
                          </NavigationMenu.Link>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="aspect-square bg-[rgb(var(--brand-light-bg))] rounded-lg overflow-hidden">
                        <img 
                          src="https://cdn.mignite.app/ws/works_01KDNQPNK2PYAKCXATDG1NMSCG/generated-01KDNQWQ8V6PDJFGXQNM13C9NB-01KDNQWQ8WJ0R0B8JW18ARBXXC.jpeg"
                          alt="Phone Cases"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-square bg-[rgb(var(--brand-light-bg))] rounded-lg overflow-hidden">
                        <img 
                          src="https://cdn.mignite.app/ws/works_01KDNQPNK2PYAKCXATDG1NMSCG/generated-01KDNQWWSB9XA2A3H2TSYY88KP-01KDNQWWSBCZCNCVQY3MH4CMYS.jpeg"
                          alt="Speakers"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            </NavigationMenu.List>

            <NavigationMenu.Viewport
              className="absolute top-full bg-white border-b border-zinc-200 shadow-lg overflow-hidden
                data-[state=open]:animate-[dropdown-open_300ms_ease-out]
                data-[state=closed]:animate-[dropdown-close_300ms_ease-out]"
              style={{ left: "50%", transform: "translateX(-50%)", width: "100vw" }}
            />
          </NavigationMenu.Root>

          {/* Mobile Menu */}
          <Drawer>
            <DrawerTrigger className="lg:hidden text-white hover:text-white/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </DrawerTrigger>
            <DrawerContent side="left">
              <DrawerHeader className="border-b border-zinc-200">
                <DrawerTitle className="flex items-center justify-center">
                  <img 
                    src="https://cdn.mignite.app/ws/works_01KDNQPNK2PYAKCXATDG1NMSCG/logo-01KDNRFNPFVTRHN3HSDREA40E9.png"
                    alt="Letscase Ghana"
                    className="h-12 w-auto"
                  />
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col py-4">
                <DrawerClose asChild>
                  <Link
                    to={baseHref || "/"}
                    className="px-6 py-3 text-zinc-900 font-medium hover:bg-[rgb(var(--brand-primary))]/10 transition-colors"
                  >
                    Home
                  </Link>
                </DrawerClose>
                <div className="px-6 py-3 text-[rgb(var(--brand-primary))] text-sm font-bold uppercase">
                  Categories
                </div>
                <div className="flex flex-col">
                  {categoryLinks.map((link) => (
                    <DrawerClose key={link.id} asChild>
                      <Link
                        to={link.to}
                        className="px-10 py-3 text-zinc-600 hover:bg-[rgb(var(--brand-primary))]/10 hover:text-[rgb(var(--brand-primary))] transition-colors"
                      >
                        {link.name}
                      </Link>
                    </DrawerClose>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Cart */}
          <div className="flex items-center gap-x-6 h-full justify-end">
            <CartDropdown />
          </div>
        </nav>
      </header>
    </div>
  )
}
