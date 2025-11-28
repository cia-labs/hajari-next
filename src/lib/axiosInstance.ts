import axios from "axios";

const createAxiosInstance = (getToken: () => Promise<string | null>) => {
  const instance = axios.create();

  instance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

export default createAxiosInstance;
