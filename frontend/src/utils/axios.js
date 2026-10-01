import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "./constants";

const apiInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 100000,
    headers: {
        Accept: "application/json",
    },
});


// Add access token to every request
apiInstance.interceptors.request.use(
    (config) => {
        const accessToken = Cookies.get("access_token");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Refresh access token when it expires
apiInstance.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // Don't try to refresh the refresh-token request itself
        if (
            error.response?.status === 401 &&
            !originalRequest?._retry &&
            !originalRequest?.url?.includes("user/token/refresh/")
        ) {
            originalRequest._retry = true;

            const refreshToken = Cookies.get("refresh_token");

            if (!refreshToken) {
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");

                return Promise.reject(error);
            }

            try {
                // IMPORTANT:
                // Use axios directly here, NOT apiInstance
                const response = await axios.post(
                    `${API_BASE_URL}user/token/refresh/`,
                    {
                        refresh: refreshToken,
                    }
                );

                const newAccessToken = response.data.access;

                Cookies.set("access_token", newAccessToken, {
                    expires: 1,
                });

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return apiInstance(originalRequest);

            } catch (refreshError) {

                console.error(
                    "Token refresh failed:",
                    refreshError
                );

                Cookies.remove("access_token");
                Cookies.remove("refresh_token");

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiInstance;