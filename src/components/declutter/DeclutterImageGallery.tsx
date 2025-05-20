
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Package } from "lucide-react";

interface DeclutterImageGalleryProps {
  images: string[] | null;
  title: string;
}

const DeclutterImageGallery = ({ images, title }: DeclutterImageGalleryProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border bg-secondary/50 flex items-center justify-center h-80">
        <Package className="h-20 w-20 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="overflow-hidden rounded-lg border">
              <AspectRatio ratio={4/3}>
                <img 
                  src={image} 
                  alt={`${title} image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </AspectRatio>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex items-center justify-center gap-2 mt-2">
        <CarouselPrevious className="static transform-none" />
        <CarouselNext className="static transform-none" />
      </div>
    </Carousel>
  );
};

export default DeclutterImageGallery;
