// app/navbar-wrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Components/Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  const showNavbar = pathname === "/";

  return showNavbar ? <Navbar /> : null;
}
