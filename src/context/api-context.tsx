/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ParentComponent, createContext, useContext } from "solid-js";

export type ApiContextType = {
  apiClient: AxiosInstance;
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, any>>;
  post: <T = unknown>(url: string, data?: object, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, any>>;
  update: <T = unknown>(url: string, data?: object, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, any>>;
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, any>>;
};

export const ApiContext = createContext<ApiContextType>();

type ApiProviderProps = {
  baseUrl: string;
};

const getCsrfToken = () => {
  const csrfElem = document.getElementById("_csrf");
  const csrfValue = !csrfElem ? undefined : (csrfElem as HTMLInputElement).value;
  return csrfValue;
};

export const ApiProvider: ParentComponent<ApiProviderProps> = (props) => {
  const apiClient = axios.create({
    baseURL: props.baseUrl,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const get = async <T = unknown,>(url: string, config?: AxiosRequestConfig) => {
    return await apiClient.get<T>(url, config);
  };

  const post = async <T = unknown,>(url: string, data?: object, config?: AxiosRequestConfig) => {
    return await apiClient.post<T>(url, data, {
      ...config,
      headers: {
        "X-CSRF-TOKEN": getCsrfToken(),
        ...(config?.headers ?? {}),
      },
      withCredentials: true,
    });
  };

  const update = async <T = unknown,>(url: string, data?: object, config?: AxiosRequestConfig) => {
    return await apiClient.put<T>(url, data, {
      ...config,
      headers: {
        "X-CSRF-TOKEN": getCsrfToken(),
        ...(config?.headers ?? {}),
      },
      withCredentials: true,
    });
  };

  const remove = async <T = unknown,>(url: string, config?: AxiosRequestConfig) => {
    return await apiClient.delete<T>(url, {
      ...config,
      headers: {
        "X-CSRF-TOKEN": getCsrfToken(),
        ...(config?.headers ?? {}),
      },
      withCredentials: true,
    });
  };

  return (
    <ApiContext.Provider value={{ apiClient, get, post, update, delete: remove }}>{props.children}</ApiContext.Provider>
  );
};

// Custom hook to use the context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};
