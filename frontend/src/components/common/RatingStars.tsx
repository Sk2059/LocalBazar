import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export default function RatingStars({ rating, size = 14, showValue = true }: RatingStarsProps) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= Math.round(rating) ? "currentColor" : "none"}
            className="text-harvest-500"
          />
        ))}
      </span>
      {showValue && <span className="font-bold text-ink">{rating.toFixed(1)}</span>}
    </span>
  );
}
