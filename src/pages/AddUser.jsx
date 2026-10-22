import React, { useState } from "react";

import UserForm from "@/components/UserForm";
import { createUser } from "@/services/userService";
import { toast } from "@/components/ui/toast"

export default function AddUser() {

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer",
  });

  const handleinputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
    };
    try {
      await createUser(payload);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Customer",
      });
      toast.add({
        type: "success",
        description: "The user has been successfully created.",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast.add({
        type: "error",
        description: "Failed to create the user. Please try again.",
      });
    }
  };

  return (
    <UserForm
      formData={formData}
      onInputChange={handleinputChange}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}