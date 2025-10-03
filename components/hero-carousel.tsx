"use client"

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"

const heroImages = [
  { src: "/hero/group.avif", alt: "Festival group gathering" },
  { src: "/hero/landrovers.avif", alt: "Land Rovers lined up" },
  { src: "/hero/landscape.avif", alt: "Tanzanian landscape" },
  { src: "/hero/outconvoy.avif", alt: "Convoy on the trail" },
  { src: "/hero/tent.avif", alt: "Camp tents at festival" },
  { src: "/hero/trails.avif", alt: "Trails and adventure" },
]

export function HeroCarousel() {
  return (
    <Carousel
      className="absolute inset-0"
      opts={{ loop: true, align: "start" }}
      plugins={[Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: false })]}
   >
      <CarouselContent>
        {heroImages.map((img, idx) => (
          <CarouselItem key={idx} className="relative h-[520px] md:h-[640px]">
            <Image src={img.src} alt={img.alt} fill priority={idx === 0} className="object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}