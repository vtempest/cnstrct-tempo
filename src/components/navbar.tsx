import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import UserProfile from "./user-profile";
import Image from "next/image";

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <nav className="w-full py-4 bg-[#1A237E] text-white">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-2">
          <div className="relative h-10 w-10">
            <Image
              src="/logo.svg"
              alt="CNSTRCT Logo"
              width={40}
              height={40}
              priority
            />
          </div>
          <span className="text-2xl font-bold text-white">CNSTRCT</span>
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link
            href="#features"
            className="text-white hover:text-[#FF5722] font-medium"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-white hover:text-[#FF5722] font-medium"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-white hover:text-[#FF5722] font-medium"
          >
            About
          </Link>
          <Link
            href="#"
            className="text-white hover:text-[#FF5722] font-medium"
          >
            Contact
          </Link>
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium">
                <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-white hover:text-[#FF5722]"
              >
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                  Sign Out
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
