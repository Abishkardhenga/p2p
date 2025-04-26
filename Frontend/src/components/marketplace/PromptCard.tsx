
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Image } from 'lucide-react';

export interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  model: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  imageUrl?: string;
}

const PromptCard = ({
  id,
  title,
  description,
  price,
  rating,
  reviews,
  model,
  category,
  author,
  imageUrl,
}: PromptCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  console.log(imageUrl)
  console.log(model)

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  return (
    <Link
      to={`/prompt/${id}`}
      className="block bg-card rounded-lg overflow-hidden shadow-sm border border-border card-hover neo-glow group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imageUrl && (
        <div className="relative w-full h-40 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
       
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="bg-neon-purple/10 text-white ">
            {model}
          </Badge>
          <span className="text-lg font-light tracking-wider text-white">{formattedPrice}</span>
        </div>
     
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
        
        
        
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            <span>{Math.floor(Math.random() * 50) + 5} using</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PromptCard;
