import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency.js";
import Button from "./Button.jsx";
import SwatchGroup from "./SwatchGroup.jsx";
import { FiShoppingCart } from "react-icons/fi";
import { useUnifiedCart } from "../Features/cart/useUnifiedCart.js";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";
import { useState, useEffect, useMemo } from "react";

const ProductInfo = ({
  product,
  onToggleReviews,
  isReviewsVisible = false,
}) => {
  const { addToCart } = useUnifiedCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const [additionalCost, setAdditionalCost] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const {
    id,
    name,
    price,
    discounted_price,
    thumbnail,
    variants: variantsData = [],
    combinations = [], // Destructure combinations
    description,
  } = product;

  // Transform variants into groups by type
  const variantGroups = useMemo(() => {
    const groups = {};

    variantsData.forEach((variant) => {
      const type = variant.name;

      if (!groups[type]) {
        groups[type] = {
          type: type,
          options: [],
          details: [],
        };
      }

      if (!groups[type].options.some((opt) => opt.value === variant.value)) {
        groups[type].options.push({
          value: variant.value,
          label: variant.value,
          hex_code: variant.hex_code, // Include hex_code if available
        });
      }

      groups[type].details.push({
        id: variant.id,
        value: variant.value,
        additional_price: variant.additional_price,
        stock: variant.stock,
        hex_code: variant.hex_code,
        created_at: variant.created_at,
      });
    });

    return Object.values(groups);
  }, [variantsData]);

  // Check if a specific option value is available given the current OTHER selections
  const checkOptionAvailability = (type, value) => {
    // If no combinations data, default to available (fallback)
    if (!combinations || combinations.length === 0) return true;

    // Create a temporary selection with the option being checked
    const testSelection = { ...selectedVariants, [type]: value };

    // Find any combination that matches this test selection
    // We only care about combinations that include ALL currently selected variants + the tested one
    // But we need to be careful: if we have 3 types (Color, Size, Material) and only Color is selected,
    // and we test Size=S, we should check if there exists ANY combination with Color=Selected AND Size=S.

    // Filter combinations that match the test selection
    const possibleCombinations = combinations.filter((combo) => {
      if (!combo.is_active || (combo.stock !== undefined && combo.stock <= 0))
        return false;

      // Check if every selected variant (including the test one) is present in this combination
      return Object.entries(testSelection).every(
        ([variantType, variantValue]) => {
          // If the variant type isn't selected yet in testSelection (shouldn't happen for the one we're testing), skip
          if (!variantValue) return true;

          // Find the variant in the combination's variant list
          const variantInCombo = combo.variants.find(
            (v) => v.name === variantType && v.value === variantValue,
          );
          return !!variantInCombo;
        },
      );
    });

    return possibleCombinations.length > 0;
  };

  // Find the exact matching combination for all currently selected variants
  const getMatchingCombination = () => {
    if (!combinations || combinations.length === 0) return null;

    return combinations.find((combo) => {
      // Must match ALL selected variants
      const allSelectedMatch = Object.entries(selectedVariants).every(
        ([type, value]) => {
          return combo.variants.some(
            (v) => v.name === type && v.value === value,
          );
        },
      );

      // And combination must have same number of variants as selected (assuming full selection)
      // Or at least, we usually want the most specific one.
      // If we differ in length, it might be a partial match, but for price calculation we usually want full match.
      return (
        allSelectedMatch &&
        combo.variants.length === Object.keys(selectedVariants).length
      );
    });
  };

  const currentCombination = getMatchingCombination();

  // Initialize selected variants
  useEffect(() => {
    if (variantGroups.length > 0) {
      setSelectedVariants((prev) => {
        const next = { ...prev };
        // If completely empty, start fresh
        if (Object.keys(next).length === 0) {
          // Find the first valid combination (active and in stock)
          const validCombo = combinations?.find(
            (c) => c.is_active && c.stock > 0,
          );

          if (validCombo) {
            validCombo.variants.forEach((v) => {
              next[v.name] = v.value;
            });
            return next;
          }

          // Fallback if no combinations data or no valid combo found: just select first options
          variantGroups.forEach((group) => {
            if (group.options.length > 0) {
              next[group.type] = group.options[0].value;
            }
          });
          return next;
        }

        // If partially selected (e.g. from props or re-mount), ensure we fill gaps if needed?
        // For now, let's stick to the initialize-empty logic or preserve existing.

        return prev;
      });
    }
  }, [variantGroups, combinations]); // Added combinations to dependency

  // Calculate generic additional cost as fallback or specific combination price
  useEffect(() => {
    // If we have a specific combination with a price modifier, use that
    if (currentCombination) {
      setAdditionalCost(parseFloat(currentCombination.price_modifier) || 0);
      return;
    }

    // Fallback: Sum individual variant costs (if legacy mode or no combinations)
    let totalAdditional = 0;
    Object.entries(selectedVariants).forEach(([type, value]) => {
      const group = variantGroups.find((g) => g.type === type);
      if (group) {
        const variant = group.details.find((v) => v.value === value);
        if (variant?.additional_price) {
          totalAdditional += parseFloat(variant.additional_price) || 0;
        }
      }
    });
    setAdditionalCost(totalAdditional);
  }, [selectedVariants, variantGroups, currentCombination]);

  const handleVariantChange = (type, value) => {
    // Before switching, we could check if it leads to a valid state.
    // For now, we allow the switch. If it results in an invalid combination,
    // the user will see that (e.g. "Add to Cart" disabled or visually indicated).
    // Or we could try to auto-select valid options for other types if the new selection breaks compatibility.

    setSelectedVariants((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const finalPrice = (
    parseFloat(discounted_price || price) + additionalCost
  ).toFixed(2);
  const navigate = useNavigate();

  const validateSelection = () => {
    // 1. Check if all types are selected
    for (const group of variantGroups) {
      if (!selectedVariants[group.type]) {
        toast.error(`Please select a ${group.type}`);
        return false;
      }
    }

    // 2. Check if the combination is valid/in-stock via backend data
    if (combinations && combinations.length > 0) {
      if (!currentCombination) {
        toast.error("Selected combination is unavailable");
        return false;
      }
      if (!currentCombination.is_active) {
        toast.error("Selected combination is currently inactive");
        return false;
      }
      if (currentCombination.stock <= 0) {
        toast.error("Selected combination is out of stock");
        return false;
      }
    }

    return true;
  };

  const constructCartItem = () => {
    // If we have a matching combination, we should probably record its ID
    const combinationId = currentCombination?.id;

    const selectedVariantDetails = Object.entries(selectedVariants)
      .map(([type, value]) => {
        const group = variantGroups.find((g) => g.type === type);
        const detail = group?.details.find((v) => v.value === value);

        if (!detail) return null;

        return {
          name: type.toLowerCase(),
          id: detail.id,
          value: value,
          hex_code: detail.hex_code, // Pass hex_code if available
          additional_price: parseFloat(detail.additional_price || 0),
        };
      })
      .filter(Boolean);

    const variantIdSuffix = Object.values(selectedVariants).sort().join("-");
    const itemId = `${id}-${variantIdSuffix}`;

    return {
      id: itemId,
      productId: id,
      name,
      newPrice: parseFloat(finalPrice),
      price: parseFloat(discounted_price || price),
      additionalCost,
      thumbnail,
      combinationId, // Store validation reference
      // Explicitly map color/size for backward compatibility
      color: selectedVariants["Color"] || selectedVariants["color"],
      size: selectedVariants["Size"] || selectedVariants["size"],
      quantity: 1,
      selected_variants: selectedVariantDetails,
    };
  };

  const handleBuyNow = async () => {
    if (!validateSelection()) return;

    const newItem = constructCartItem();
    addToCart(id, 1, newItem);
    toast.success("Proceeding to summary...");
    navigate("/cart/summary");
  };

  const handleAddToCart = async () => {
    if (!isMounted) return;
    if (!validateSelection()) return;

    try {
      setIsAddingToCart(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newItem = constructCartItem();
      console.log({ newItem });
      addToCart(id, 1, newItem);

      toast.success(`${name} has been added to your cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      if (isMounted) {
        setIsAddingToCart(false);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-text-primary text-3xl font-bold lg:text-4xl">
        {name}
      </h1>
      <div className="space-y-1">
        <div className="flex items-baseline gap-4">
          <span className="text-text-primary text-2xl font-medium lg:text-3xl">
            {formatCurrency(discounted_price || price)}
          </span>
          {discounted_price && (
            <span className="text-text-secondary/70 text-lg line-through opacity-70">
              {formatCurrency(price)}
            </span>
          )}
        </div>
        {additionalCost !== 0 && (
          <p className="text-sm text-gray-500">
            {additionalCost > 0 ? "+" : ""}
            {formatCurrency(additionalCost)} modifier
          </p>
        )}
      </div>
      <p className="text-text-secondary leading-relaxed">{description}</p>

      <div className="space-y-6">
        {variantGroups.map((group) => (
          <SwatchGroup
            key={group.type}
            label={group.type}
            type={group.type}
            options={group.options} // Now includes hex_code
            selectedValue={selectedVariants[group.type]}
            onChange={(value) => handleVariantChange(group.type, value)}
            getOptionStatus={(value) => {
              // Optional: Pass capability to check if this option is valid given OTHER current selections
              const isAvailable = checkOptionAvailability(group.type, value);
              return { disabled: !isAvailable };
            }}
          />
        ))}
      </div>

      <div className="py-4 text-sm">
        <p className="font-semibold">
          {currentCombination && currentCombination.stock > 0
            ? `In Stock (${currentCombination.stock} available)`
            : currentCombination
              ? "Out of Stock"
              : "Select options to see availability"}
        </p>
        <p className="mt-1 font-normal text-gray-500">
          Buy now and receive between February 12th - 14th!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Button
          variant="secondary"
          onClick={handleBuyNow}
          className="flex w-full cursor-pointer items-center justify-center gap-2 bg-gray-950 text-gray-50"
          disabled={currentCombination?.stock <= 0}
        >
          {`Proceed to Payment (${formatCurrency(finalPrice)})`}
        </Button>
        <Button
          variant="primary"
          onClick={handleAddToCart}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 ${
            isAddingToCart ? "cursor-not-allowed opacity-75" : ""
          }`}
          disabled={isAddingToCart || currentCombination?.stock <= 0}
        >
          {isAddingToCart ? (
            <>
              <FiLoader className="animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <span>Add to Cart</span>
              <FiShoppingCart />
            </>
          )}
        </Button>
      </div>
      <div className="">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (onToggleReviews) onToggleReviews();
          }}
          className="text-text-secondary hover:text-accent cursor-pointer text-sm font-medium transition-colors"
        >
          {isReviewsVisible ? "Hide Reviews" : "See Reviews"}
        </button>
      </div>
    </div>
  );
};
export default ProductInfo;
