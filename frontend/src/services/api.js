import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Predict solar AC power using the trained Random Forest model
export const predictSolarPower = async (data, context = {}) => {
    const response = await api.post(
        "/analysis/predict-power",
        {
            MODULE_TEMP: data.MODULE_TEMP,
            Amb_Temp: data.Amb_Temp,
            WIND_Speed: data.WIND_Speed,
            IRR: data.IRR,
            DC_Current: data.DC_Current,
            AC_Ir: data.AC_Ir,
            AC_Iy: data.AC_Iy,
            AC_Ib: data.AC_Ib,
            project_id: context.projectId || null,
            site_id: context.siteId || null,
        }
    );

    return response.data;
};

export const downloadSiteAnalysisPdf = async ({ latitude, longitude, siteName, analysisId }) => {
    const response = await api.post(
        "/analysis/report/pdf",
        { latitude, longitude, site_name: siteName || null, analysis_id: analysisId || null },
        { responseType: "blob" }
    );

    return response.data;
};

export default api;
