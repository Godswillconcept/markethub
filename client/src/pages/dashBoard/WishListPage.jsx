import WishlistCard from "../../ui/WishListCard.jsx";
import PaginatedGrid from "./PaginatedGrid.jsx";
import { useWishlist } from "../../Features/productFeatures/useWishlist.js";
import { useRemoveWishlist } from "../../Features/productFeatures/useRemovewishlist.js";
import { useNavigate } from "react-router-dom";

const WishlistItem = ({ item, onRemove, onAddToCart }) => (
  <WishlistCard
    product={item}
    onRemove={() => onRemove(item.wishlistId)}
    onAddToCart={() => onAddToCart(item)}
  />
);

function WishListPage() {
  const navigate = useNavigate();
  const { wishlist, isLoading } = useWishlist();
  const { removeFromWishlist } = useRemoveWishlist();

  const handleRemoveFromWishlist = (wishlistId) => {
    console.log("Removing wishlist item:", wishlistId);
    removeFromWishlist(wishlistId);
  };

  const handleAddToCart = (item) => {
    // Navigate to the product detail page
    navigate(`/product/${item.id}`);
  };

  const WishlistCardWithHandlers = ({ item }) => (
    <WishlistItem
      item={item}
      onRemove={handleRemoveFromWishlist}
      onAddToCart={handleAddToCart}
    />
  );

  return (
    <div className="p-6">
      <PaginatedGrid
        title="My Wishlist"
        items={wishlist}
        isLoading={isLoading}
        CardComponent={WishlistCardWithHandlers}
        emptyTitle="Your wishlist is empty"
        emptyDescription="Start saving your favorite items here!"
        emptyRedirect="/shop"
        emptyRedirectLabel="Go to Shop"
      />
    </div>
  );
}

export default WishListPage;
