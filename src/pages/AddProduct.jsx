import React, { useEffect, useRef, useState } from "react";
import { createProduct } from "@/services/productService";
import { toast } from "@/components/ui/toast";
import ProductForm from "@/components/PrductForm";
import { getAllCollections } from "@/services/productCollectionService";

export default function AddProduct() {
  const [loading, setLoading] = useState(false);

  const initialFormState = {
    title: "",
    description: "",
    basePrice: "",
    discountPrice: "",
    stock: "",
    sku: "",
    collections: [],
  };

  const [productData, setProductData] = useState(initialFormState);
  const [collectionList, setCollectionList] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const formRef = useRef(null);

  const resetForm = () => {
    setProductData(initialFormState);
    setImageFile(null);
    formRef.current?.reset();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const collectionId = value;
      setProductData((prev) => {
        return {
          ...prev,
          collections: checked
            ? [...prev.collections, collectionId]
            : prev.collections.filter((id) => id !== collectionId),
        };
      });

      return;
    }

    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", productData.title);
      formData.append("description", productData.description);
      formData.append("basePrice", productData.basePrice);
      formData.append("discountPrice", productData.discountPrice);
      formData.append("stock", productData.stock);
      formData.append("sku", productData.sku);
      productData.collections.forEach((collectionId) => {
        formData.append("collections[]", collectionId);
      });

      if (imageFile) {
        formData.append("productImg", imageFile);
      }

      await createProduct(formData);

      toast.add({
        type: "success",
        description: "Product has been created successfully.",
      });

      resetForm();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.add({
        type: "error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to create product. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    resetForm();
  };

  useEffect(() => {
    const collections = async () => {
      try {
        const data = await getAllCollections();
        setCollectionList(data);
      } catch (error) {
        console.log(error);
      }
    };

    collections();
  }, []);

  return (
    <>
      <ProductForm
        productData={productData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleFormSubmit={handleFormSubmit}
        clearForm={clearForm}
        loading={loading}
        formRef={formRef}
        collectionList={collectionList}
      />
    </>
  );
}
