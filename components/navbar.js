"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Image
                src="/MKN-GROUP-LOGO.png"
                alt="MKN Group Logo"
                width={40}
                height={40}
                quality={95}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xl text-foreground leading-none font-montserrat">
                {site.name}
                <sup className="text-sm font-black relative -top-2">®</sup>
              </span>
              <span className="text-xs text-muted-foreground font-medium lg:block leading-none">
                Üretimden Pazarlamaya
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {site.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/teklif">Teklif Al</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menüyü aç</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigasyon Menüsü</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Image
                          src="/MKN-GROUP-LOGO.png"
                          alt="MKN Group Logo"
                          width={36}
                          height={36}
                          quality={95}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="font-bold text-lg leading-none text-foreground font-montserrat">
                          {site.name}
                          <sup className="text-sm font-black relative -top-1">
                            ®
                          </sup>
                        </span>
                        <span className="text-xs text-muted-foreground font-medium leading-none">
                          Üretimden Pazarlamaya
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 px-4 py-6">
                    <div className="space-y-1">
                      {site.navigation.map((item, index) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                            "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:translate-x-1",
                            isActive(item.href)
                              ? "bg-gradient-to-r from-primary/15 to-primary/10 text-primary border-l-4 border-primary shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <span className="relative">
                            {item.name}
                            {isActive(item.href) && (
                              <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-primary rounded-full"></span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </nav>

                  {/* Footer */}
                  <div className="p-4 border-t bg-gradient-to-r from-muted/30 to-muted/10">
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      size="lg"
                    >
                      <Link
                        href="/teklif"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2"
                      >
                        <span>Teklif Al</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Profesyonel çözümler için bize ulaşın
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
