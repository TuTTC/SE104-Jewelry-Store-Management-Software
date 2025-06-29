import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselItem } from '@/components/ui/carousel';

export default function JewelryHomePage() {
  return (
    <div className="bg-white text-neutral-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b">
        <div className="text-xl font-bold">🌸</div>
        <nav className="hidden md:flex gap-6 uppercase text-sm font-medium">
          <a href="#" className="hover:text-amber-500">Home</a>
          <a href="#" className="hover:text-amber-500">Jewelry</a>
          <a href="#" className="hover:text-amber-500">Collection</a>
          <a href="#" className="hover:text-amber-500">Information</a>
          <a href="#" className="hover:text-amber-500">Post</a>
          <a href="#" className="hover:text-amber-500">Contact</a>
        </nav>
        <div className="flex gap-4">
          <button>📍</button>
          <button>🔍</button>
          <button>🛒</button>
          <button>☰</button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative w-full h-[70vh] bg-cover bg-center flex items-center justify-center text-white" style={{ backgroundImage: 'url(/hero.jpg)' }}>
        <div className="text-center">
          <h1 className="text-5xl font-light">the autumn equinox</h1>
          <p className="mt-4">Fashion radiance. Shop for our new-season starting below.</p>
          <Button className="mt-6 bg-white text-black">Shop Now</Button>
        </div>
      </section>

      {/* Collections */}
      <section className="px-4 md:px-16 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-8 uppercase">Collections</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <img key={i} src={`/collection${i}.jpg`} alt={`Collection ${i}`} className="rounded-md w-full" />
          ))}
        </div>
      </section>

      {/* Timeless Values */}
      <section className="grid md:grid-cols-2 gap-8 px-4 py-16 md:px-16 items-center">
        <img src="/timeless.jpg" alt="Timeless" className="rounded-md" />
        <div>
          <h2 className="text-4xl font-thin leading-snug">Pure<br/>Timeless<br/>Values</h2>
          <p className="mt-4 text-sm">
            We bring you exquisite 100% natural gemstones, meticulously crafted to honor elegance and sophistication. Each one is not just jewelry but a symbol of luck and prestige.
          </p>
          <Button className="mt-4 bg-amber-500 text-white">Read More</Button>
        </div>
      </section>

      {/* Category Shop */}
      <section className="py-12 px-4 md:px-16 text-center">
        <h3 className="text-xl font-bold mb-4">Shop by category</h3>
        <p className="text-sm mb-8">Indulge in what sets you apart</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Charms'].map((item, i) => (
            <div key={i} className="space-y-2">
              <img src={`/category${i + 1}.jpg`} alt={item} className="rounded-md" />
              <p className="text-xs uppercase font-medium">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="grid md:grid-cols-2 items-center bg-black text-white px-4 md:px-16 py-16">
        <img src="/quote.jpg" alt="Quote" className="rounded-md hidden md:block" />
        <div className="space-y-6 text-center md:text-left">
          <h3 className="italic text-xl font-light">“Shine bright like a diamond!”</h3>
          <p className="text-sm">Believe in your sparkle. Be it for you, or the precious nature’s jewels, uniqueness is power. Discover radiance in its most refined form with our handcrafted jewels.</p>
          <Button className="bg-white text-black">Read More</Button>
        </div>
      </section>

      {/* Glittering Novelties */}
      <section className="py-12 px-4 md:px-16 text-center">
        <h3 className="text-xl font-bold mb-8">Glittering Novelties</h3>
        <Carousel>
          {[1, 2, 3, 4, 5].map(i => (
            <CarouselItem key={i}>
              <Card>
                <CardContent className="p-4">
                  <img src={`/novelty${i}.jpg`} alt={`Novelty ${i}`} className="rounded-md" />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </Carousel>
      </section>

      {/* Gifts of the Season */}
      <section className="grid md:grid-cols-2 gap-6 px-4 md:px-16 py-16 items-center">
        <div className="space-y-4">
          <h4 className="text-2xl font-semibold">Gifts of the season</h4>
          <p className="text-sm">Some gifts are beyond the moment—they become timeless in memory. Discover a collection designed to make the season sparkle, no matter the reason.</p>
          <Button className="bg-amber-500 text-white">Shop Gifts</Button>
        </div>
        <img src="/gift.jpg" alt="Gift" className="rounded-md" />
      </section>

      {/* Final section */}
      <section className="grid md:grid-cols-2 gap-6 px-4 md:px-16 py-16 bg-black text-white items-center">
        <img src="/madefor.jpg" alt="Made For" className="rounded-md" />
        <div className="space-y-4">
          <h4 className="text-xl font-semibold">What were we made for?</h4>
          <p className="text-sm">
            At PTV, we believe in beauty beyond just the surface. Every gem is a story, every piece a symbol of identity and distinction.
            <br /><br />
            Join us in our journey to empower the modern soul who wears not trends but character.
          </p>
          <Button className="bg-white text-black">About Us</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-sm text-neutral-600 px-4 md:px-16 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-semibold mb-2">Customer Service</h5>
            <ul className="space-y-1">
              <li>Contact</li>
              <li>Returns</li>
              <li>FAQs</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Information</h5>
            <ul className="space-y-1">
              <li>About</li>
              <li>Careers</li>
              <li>Store Locator</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">My Account</h5>
            <ul className="space-y-1">
              <li>Login</li>
              <li>Orders</li>
              <li>Wishlist</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Follow Us</h5>
            <div className="flex gap-2">
              <span>📸</span>
              <span>📘</span>
              <span>🐦</span>
              <span>📌</span>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500">
          © 2025 Your Jewelry Brand. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
