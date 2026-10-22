import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "./ui/checkbox";

const PrductForm = ({
  productData,
  productImg,
  isEdit = false,
  isModified = true,
  handleInputChange,
  handleFileChange,
  handleFormSubmit,
  clearForm,
  loading,
  formRef,
  collectionList,
}) => {
  return (
    <>
      <div className="py-6">
        <form ref={formRef} onSubmit={handleFormSubmit}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isEdit ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "Update the product details in your store inventory."
                  : "Add a new product to your eCommerce store inventory."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={clearForm} variant="outline" type="button">
                Cancel
              </Button>
              {/* onclick ko hata kar type="submit" par chor diya hai taake form submit trigger ho */}
              <Button type="submit" disabled={loading || !isModified}>
                {loading
                  ? "Saving..."
                  : isEdit
                    ? "Update Product"
                    : "Save Product"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEdit ? "Product Details" : "General Information"}
                </CardTitle>
                <CardDescription>
                  {isEdit
                    ? "Update the product information."
                    : "Provide basic information about the product."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">
                    Product Title
                  </label>
                  <Input
                    name="title"
                    value={productData.title}
                    placeholder="e.g. Wireless Gaming Mouse"
                    required
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    value={productData.description}
                    placeholder="Write a brief description of the product..."
                    className="min-h-30"
                    required
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>
                    Set the pricing details for the item.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">
                      Base Price ($)
                    </label>
                    <Input
                      name="basePrice"
                      value={productData.basePrice}
                      type="number"
                      placeholder="0.00"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">
                      Discount Price ($)
                    </label>
                    <Input
                      name="discountPrice"
                      value={productData.discountPrice}
                      type="number"
                      placeholder="0.00"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                  <CardDescription>Manage stock and SKU.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">
                      Stock Quantity
                    </label>
                    <Input
                      name="stock"
                      value={productData.stock}
                      type="number"
                      placeholder="0"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">
                      SKU (Stock Keeping Unit)
                    </label>
                    <Input
                      name="sku"
                      value={productData.sku}
                      placeholder="e.g. GM-WL-01"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Collections</CardTitle>
                <CardDescription>
                  Assign this product to one or multiple collections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collectionList.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {collectionList.map((col) => {
                      const isChecked = (
                        productData.collections || []
                      ).includes(col._id);
                      return (
                        <label
                          key={col._id}
                          className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? "border-primary bg-primary/5"
                              : "hover:bg-accent"
                          }`}
                        >
                          <Checkbox
                            name="collections"
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              handleInputChange({
                                target: {
                                  name: "collections",
                                  value: col._id,
                                  type: "checkbox",
                                  checked,
                                },
                              });
                            }}
                          />
                          <span className="text-sm font-medium truncate">
                            {col.collectionname}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No collections found. Create a collection first.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Media / Images */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEdit ? "Product Image" : "Upload Image"}
                </CardTitle>
                <CardDescription>
                  {isEdit
                    ? "View the current image or upload a replacement."
                    : "Upload product gallery image."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {productImg && (
                    <img
                      src={productImg}
                      alt={`${productData.title || "Product"} current image`}
                      className="mb-2 h-40 w-40 rounded-md border object-cover"
                    />
                  )}
                  <Input
                    name="productImg"
                    type="file"
                    accept="image/*"
                    required={!isEdit}
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </>
  );
};

export default PrductForm;
