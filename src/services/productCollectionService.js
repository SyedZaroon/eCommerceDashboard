import api from "./api";

export const createCollection = async (collectionData) => {
  try {
    const response = await api.post("/productcollection", collectionData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating collection:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllCollections = async()=>{
    try{
        const response = await api.get("/productcollection");
        return response.data;
    }
    catch (error) {
    console.error("Error fetching collections:", error.response?.data || error.message);
    throw error;
  }

}


export const deleteCollection = async(id)=>{
    try{
        const response = await api.delete(`/productcollection/delete/${id}`);
        return response.data;
    }
    catch (error) {
    console.error("Error fetching collections:", error.response?.data || error.message);
    throw error;
  }

}