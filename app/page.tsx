import { CartProvider } from "@/lib/cart-context"
import { ProductsProvider } from "@/lib/products-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { MarqueeBanner } from "@/components/marquee-banner"
import { ProductsSection } from "@/components/products-section"
import { FeaturesSection } from "@/components/features-section"
import { AboutSection } from "@/components/about-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import InstallPWAButton from "@/components/InstallPWAButton"
import RegisterSW from "@/components/RegisterSW"

export default function Page() {
  return (
    <AuthProvider>
  <RegisterSW />
      <ProductsProvider>
        <CartProvider>
          <Navbar />
          <InstallPWAButton />
          <main>
            <Hero />
            <MarqueeBanner />
            <ProductsSection />
            <FeaturesSection />
            <AboutSection />
            <NewsletterSection />
            <ContactSection />
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}
