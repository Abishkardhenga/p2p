import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { VITE_BASE_URL } from "../configs/env";
import { createHttpException } from "../exceptions/http.exception";
const axiosInstance = axios.create({
  baseURL: VITE_BASE_URL, //add this in env
  timeout: 300000,
});

axiosInstance.interceptors.request.use((config) => {
  // Logic to add some headers should be placed here
  return config;
});

const handleSuccess = (response: AxiosResponse) => response.data;

const handleError = (error: AxiosError): never => {
  const { status, statusText, data } = error.response ?? {};

  const message =
    typeof data === "object" && data !== null && "message" in data
      ? (data as { message?: string }).message
      : statusText || "Axios Error";

  const stack = error.stack || "";
  throw createHttpException(status ?? 500, message ?? "Axios Error", stack);
};

export const apiRequest = async (config: AxiosRequestConfig) => {
  try {
    const response = await axiosInstance.request(config);
    return handleSuccess(response);
  } catch (error) {
    handleError(error as AxiosError);
  }
};

export const apiGet = async (url: string, config?: AxiosRequestConfig) => {
  return apiRequest({ ...config, url, method: "GET" });
};

export const apiPost = async (url: string, data?: any, config?: AxiosRequestConfig) => {
  return apiRequest({ ...config, url, method: "POST", data });
};

export const apiPut = async (url: string, data?: any, config?: AxiosRequestConfig) => {
  return apiRequest({ ...config, url, method: "PUT", data });
};

export const apiDelete = async (url: string, data?: any, config?: AxiosRequestConfig) => {
  return apiRequest({ ...config, url, method: "DELETE", data });
};

/*
Example of using  

const users = await apiGet("/users");
const newUser = await apiPost("/users", { name: "John Doe" });

Use of config 

const response = await apiGet("/users", {
  headers: { Authorization: "Bearer your_token" },
});

const response = await apiGet("/users", {
  params: { role: "admin", active: true },
});

const response = await apiGet("/users", { timeout: 5000 });

const newUser = await apiPost(
  "/users",
  { name: "John Doe" },
  { headers: { "Content-Type": "application/json" } }
);

*/
