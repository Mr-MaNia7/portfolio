'use client';
import { Card, Carousel } from '@/components/projects/apple-cards-carousel';
import { data } from '@/components/projects/ConfigData';

export default function AllProjects() {
  const cards = data.map((card, index) => (
    <Card key={card.src + index} card={card} index={index} layout={true} />
  ));

  return (
    <div className="w-full py-2">
      <header className="mx-auto max-w-3xl">
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
          Selected work
        </span>
        <h2 className="font-display mt-1 text-2xl tracking-tight text-foreground sm:text-3xl">
          Things I&apos;ve built
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Client work and research — tap any card for the detail.
        </p>
      </header>
      <Carousel items={cards} />
    </div>
  );
}
