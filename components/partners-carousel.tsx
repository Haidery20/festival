"use client"

import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

export function PartnersCarousel() {
  return (
    <Carousel
      opts={{ loop: true, align: "start" }}
      plugins={[
        Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-2">
        <CarouselItem className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
          <div className="h-20 sm:h-24 md:h-28 flex items-center justify-center rounded-lg border border-border bg-card p-2">
            <Image src="/partners/gov.svg" alt="Government of Tanzania" width={96} height={40} />
          </div>
        </CarouselItem>
        <CarouselItem className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
          <div className="h-20 sm:h-24 md:h-28 flex items-center justify-center rounded-lg border border-border bg-card">
            <Image src="/partners/lrct.svg" alt="Land Rover Club Tanzania" width={120} height={50} />
          </div>
        </CarouselItem>
        <CarouselItem className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
          <div className="h-20 sm:h-24 md:h-28 flex items-center justify-center rounded-lg border border-border bg-card">
            <Image src="/partners/wanda.jpg" alt="Wanda" width={96} height={40} />
          </div>
        </CarouselItem>
        <CarouselItem className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
          <div className="h-20 sm:h-24 md:h-28 flex items-center justify-center rounded-lg border border-border bg-card">
            <Image src="/partners/g4l.jpg" alt="G4L" width={120} height={50} />
          </div>
        </CarouselItem>
        <CarouselItem className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
          <div className="h-20 sm:h-24 md:h-28 flex items-center justify-center rounded-lg border border-border bg-card">
            <Image src="/partners/afriroots.avif" alt="Afriroots" width={120} height={50} />
          </div>
        </CarouselItem>
        <CarouselItem className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
          <div className="h-20 sm:h-24 md:h-28 flex items-center justify-center rounded-lg border border-border bg-card">
            <Image src="/partners/samcare.avif" alt="Samcare" width={120} height={50} />
          </div>
        </CarouselItem>
        <CarouselItem className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
          <div className="h-20 sm:h-24 md:h-28 flex items-center justify-center rounded-lg border border-border bg-card">
            <Image src="/partners/weibull.avif" alt="Weibull" width={120} height={50} />
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious className="-left-4" />
      <CarouselNext className="-right-4" />
    </Carousel>
  )
}