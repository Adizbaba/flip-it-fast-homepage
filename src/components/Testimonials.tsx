
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Buyer',
    image: 'https://picsum.photos/id/1027/200',
    content: 'FastFlip is amazing! I found a vintage camera I\'d been searching for at a great price. The bidding process was exciting and the seller shipped quickly.',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Seller',
    image: 'https://picsum.photos/id/1012/200',
    content: 'I\'ve sold over 50 items on FastFlip and the process has always been smooth. The platform makes it easy to list items and the fees are reasonable.',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Buyer & Seller',
    image: 'https://picsum.photos/id/1009/200',
    content: 'I both buy and sell on FastFlip regularly. The community is great and I love how transparent the auction process is. Definitely recommend!',
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <section className="py-12 bg-gradient-to-tr from-auction-purple/5 to-auction-magenta/5">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-10 text-center">What Our Users Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} 
                  />
                ))}
              </div>
              
              <p className="text-gray-600">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
