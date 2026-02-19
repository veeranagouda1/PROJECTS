import axios from "../../api/axios";

export const loginApi = async (email, password) => {
  const response = await axios.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

