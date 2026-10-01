const RAW_SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
export const SERVER_URL = RAW_SERVER_URL.endsWith('/') ? RAW_SERVER_URL : `${RAW_SERVER_URL}/`;
export const API_BASE_URL = `${SERVER_URL}api/v1/`;
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'BAAXoo7cSz5mtcIO-jLpNQvqX0JIn_bMcV4XCEFR5ObJVl96T7wlYt7RG0BKqIh-2_XMkMVqKxvs1-PEF4';