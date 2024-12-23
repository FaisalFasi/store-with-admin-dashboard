import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useProductStore } from "../../stores/useProductStore";
import Button from "../../components/shared/Button/Button";
import ZoomImage from "../../components/shared/ZoomImage/ZoomImage";
import { useCartStore } from "../../stores/useCartStore";
import { toast } from "react-hot-toast";
import { getUserData } from "../../utils/getUserData.js";

const SingleProductPage = () => {
  const { productId } = useParams();
  const {
    fetchProductById,
    products: product,
    loading: isLoading,
  } = useProductStore();

  const { addToCart } = useCartStore();

  const { user } = getUserData();
  const [selectedImage, setSelectedImage] = useState("");

  const handleAddToCart = () => {
    console.log("Add to cart");
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    } else {
      addToCart(product);
    }
  };

  useEffect(() => {
    fetchProductById(productId);
  }, [productId, fetchProductById]);

  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  if (isLoading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center text-white">Product not found!</div>;
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16"
        >
          {/* Left Section - Images */}
          <div className="flex flex-col items-center">
            <div className="w-full h-full flex items-center justify-center">
              {/* Fixed size for image */}
              <ZoomImage
                src={selectedImage}
                className=" object-cover w-[300px] h-[400px] md:w-[400px] md:h-[500px] lg:w-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-lg"
              />
            </div>
            <div className="max-w-full h-full flex items-center justify-start py-6 overflow-x-scroll">
              <div className="min-w-max flex gap-4">
                {product?.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`w-full h-full border-4 transition rounded-sm ${
                      selectedImage === image
                        ? "border-emerald-400"
                        : "border-gray-600"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-sm"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Product Details */}
          <div className="flex flex-col justify-center">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl lg:text-4xl font-bold text-emerald-400 mb-4"
            >
              {product.name}
            </motion.h1>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {product.description}
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-emerald-400 text-2xl lg:text-3xl font-bold mb-6"
            >
              ${product.price}
            </motion.div>
            <Button
              isBG={true}
              className="self-start"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SingleProductPage;
