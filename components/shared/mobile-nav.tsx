'use client'

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { navLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const MobileNav = () => {
  const pathname = usePathname()

  return (
    <header className="header">
      <Link href="/" prefetch className="flex items-center gap-2 md:py-2">
        <Image
          src="/assets/images/pixel-mind-logo.svg"
          alt="PixelMind"
          width={134}
          height={48}
          priority
        />
      </Link>

      <nav className="flex gap-2">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />

          <Sheet>
            <SheetTrigger>
              <Image
                src="/assets/icons/menu.svg"
                alt="Menu"
                width={32}
                height={32}
                className="cursor-pointer"
              />
            </SheetTrigger>
            <SheetContent className="sheet-content sm:w-64">
              <>
                <VisuallyHidden.Root>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Mobile Navigation</SheetDescription>
                </VisuallyHidden.Root>

                <Image
                  src="/assets/images/pixel-mind-logo.svg"
                  width={375}
                  height={135}
                  alt="PixelMind"
                  className="w-10/12 pl-2"
                />
                <ul className="header-nav_elements">
                  {navLinks.map((link) => {
                    const isActive = link.route === pathname

                    return (
                      <li
                        key={link.route}
                        className={cn(
                          'p-18 flex whitespace-nowrap text-dark-700',
                          isActive && 'text-purple-500',
                        )}
                      >
                        <Link prefetch className="sidebar-link_right" href={link.route}>
                          <Image
                            src={link.icon}
                            alt="logo"
                            width={20}
                            height={20}
                            className="size-5"
                          />
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </>
            </SheetContent>
          </Sheet>
        </SignedIn>

        <SignedOut>
          <Button asChild className="button bg-purple-gradient bg-cover">
            <Link href="/sign-in" prefetch>
              Login
            </Link>
          </Button>
        </SignedOut>
      </nav>
    </header>
  )
}

export default MobileNav
