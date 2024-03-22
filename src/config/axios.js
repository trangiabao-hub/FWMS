import axios from "axios";
const baseUrl = "https://fwms-rmv2.azurewebsites.net/api";

const config = {
  baseUrl,
};
const api = axios.create(config);
api.defaults.baseURL = baseUrl;
const handleBefore = (config) => {
  const token = localStorage.getItem("token")?.replaceAll('"', "");
  console.log(token);
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
};
api.interceptors.request.use(handleBefore, null);

export default api;
