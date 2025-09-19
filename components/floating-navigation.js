import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronUp,
  Factory,
  TrendingUp,
  Phone,
  ShoppingCart,
  Box,
} from "lucide-react";

export function FloatingNavigation() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navigationItems = [
    {
      id: "hero",
      label: "Ana Sayfa",
      icon: ChevronUp,
      href: "#hero",
    },
    {
      id: "services",
      label: "Hizmetler",
      icon: TrendingUp,
      href: "#services",
    },
    {
      id: "manufacturing",
      label: "Fason Üretim",
      icon: Factory,
      href: "#manufacturing",
    },
    {
      id: "packaging",
      label: "Ambalaj",
      icon: Box,
      href: "#packaging",
    },
    {
      id: "ecommerce",
      label: "E-Ticaret",
      icon: ShoppingCart,
      href: "#ecommerce",
    },
    {
      id: "contact",
      label: "İletişim",
      icon: Phone,
      href: "#contact",
    },
  ];

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      const sections = [
        "hero",
        "services",
        "manufacturing",
        "packaging",
        "ecommerce",
        "contact",
      ];
      const scrollPosition = window.scrollY + 200; // Daha hassas detection için artırıldı

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;

          if (scrollPosition >= offsetTop - 100) {
            // Daha erken detection
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Quick Access Menu */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-2 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`group relative w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center ${
                    isActive
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white text-gray-600 dark:text-gray-300"
                  }`}
                  title={item.label}
                >
                  <IconComponent className="h-5 w-5" />

                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 dark:border-gray-600">
                    {item.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-3">
        {/* İletişim Butonu */}
        <Link href="/iletisim">
          <button className="group bg-green-600 hover:bg-green-700 text-white w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center">
            <Phone className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </button>
        </Link>

        {/* Scroll to Top Butonu */}
        <button
          onClick={scrollToTop}
          className="group bg-primary hover:bg-primary/90 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          title="Başa Dön"
        >
          <ChevronUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </>
  );
}
