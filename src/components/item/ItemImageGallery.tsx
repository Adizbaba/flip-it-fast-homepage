
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ItemImageGalleryProps {
  images: string[];
  title: string;
}

const ItemImageGallery = ({ images, title }: ItemImageGalleryProps) => {
  return (
    <div>
      <Carousel>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="overflow-hidden rounded-md">
                <img
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  className="w-full aspect-square object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    target.onerror = null; // Prevent infinite error loop
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default ItemImageGallery;
