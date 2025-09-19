import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { OrganizationSchema, WebsiteSchema } from "@/components/structured-data"

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <WebsiteSchema />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
