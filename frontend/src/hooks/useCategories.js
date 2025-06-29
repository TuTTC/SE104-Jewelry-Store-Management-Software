import { useState, useEffect } from "react";
import categoryApi from "../api/categoryApi";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      const formatted = data.map((item) => ({
        id: item.MaDM,
        name: item.TenDM,
        description: item.MoTa,
      }));
      setCategories(formatted);
    } catch (err) {
      setError(err.message);
    }
  };

  const addCategory = async (newData) => {
    try {
      const response = await categoryApi.add(newData);
      setCategories((prev) => [
        ...prev,
        {
          id: response.MaDM,
          name: newData.TenDM,
          description: newData.MoTa,
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      await categoryApi.update(id, updatedData);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};

export default useCategories;
