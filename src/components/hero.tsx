import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#1A237E] text-white">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="text-left max-w-2xl">
              <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#FF5722]/20 text-[#FF5722] mb-6">
                <span className="text-sm font-semibold mr-2">New</span>
                <span className="text-sm">See our pricing plans</span>
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-8 tracking-tight">
                Simplify Your{" "}
                <span className="text-[#FF5722]">Construction</span> Projects
              </h1>

              <p className="text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
                CNSTRCT streamlines communication between homeowners and
                contractors, making project management and payments seamless and
                transparent.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white px-8 py-6 h-auto text-lg">
                    Go to Dashboard
                    <ArrowUpRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>

                <Link href="#pricing">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 py-6 h-auto text-lg"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#FF5722]/20 p-1">
                    <Check className="w-5 h-5 text-[#FF5722]" />
                  </div>
                  <span className="text-gray-300">
                    Streamlined payment processing
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#FF5722]/20 p-1">
                    <Check className="w-5 h-5 text-[#FF5722]" />
                  </div>
                  <span className="text-gray-300">
                    Real-time project tracking
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#FF5722]/20 p-1">
                    <Check className="w-5 h-5 text-[#FF5722]" />
                  </div>
                  <span className="text-gray-300">Secure document sharing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#FF5722]/20 p-1">
                    <Check className="w-5 h-5 text-[#FF5722]" />
                  </div>
                  <span className="text-gray-300">
                    Automated milestone notifications
                  </span>
                </div>
              </div>
            </div>

            <div className="relative w-full max-w-xl">
              <div className="bg-[#2C387E] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="h-3 w-3 rounded-full bg-[#FF5722] mr-2"></div>
                  <span className="text-white font-medium">
                    Payment Dashboard
                  </span>
                  <div className="ml-auto flex space-x-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/50"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-white/50"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-white/50"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#3949AB] rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-[#FF5722] p-2 rounded mr-3">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/30 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="text-[#FF5722] font-bold">$12,450</div>
                  </div>

                  <div className="bg-[#3949AB] rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-[#FF5722] p-2 rounded mr-3">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/30 rounded w-40"></div>
                      </div>
                    </div>
                    <div className="text-[#FF5722] font-bold">$8,320</div>
                  </div>

                  <div className="bg-[#3949AB] rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-[#FF5722] p-2 rounded mr-3">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/30 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-[#FF5722] font-bold">$5,780</div>
                  </div>
                </div>

                <div className="mt-6 bg-[#FF5722]/20 rounded-lg p-4 flex justify-between items-center">
                  <span className="text-white font-medium">Total:</span>
                  <span className="text-[#FF5722] font-bold text-xl">
                    $26,550
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
