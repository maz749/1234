import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const AI_URL  = process.env.NEXT_PUBLIC_AI_URL  || 'http://localhost:8000';

export const api = axios.create({ baseURL: `${API_URL}/api/v1` });
export const aiApi = axios.create({ baseURL: `${AI_URL}/api/v1` });

// Attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('facade_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Material {
  id: number;
  name: string;
  type: string;
  texture_url: string;
  price_per_m2: number;
  color: string;
  in_stock: boolean;
}

export interface Facade {
  id: number;
  name: string;
  material_id: number;
  image_url: string;
  category: string;
  material?: Material;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  config_json: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id?: number;
  customer_name: string;
  phone: string;
  email: string;
  message?: string;
  project_id?: number;
}

export interface CalculatorResult {
  area: number;
  material_name: string;
  price_per_m2: number;
  base_price: number;
  doors_price: number;
  drawers_price: number;
  total_price: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

// ── API FUNCTIONS ─────────────────────────────────────────────────────────────

export const getMaterials = () => api.get<Material[]>('/materials').then(r => r.data);
export const getMaterial  = (id: number) => api.get<Material>(`/materials/${id}`).then(r => r.data);

export const getFacades = (category?: string) =>
  api.get<Facade[]>('/facades', { params: category ? { category } : {} }).then(r => r.data);

export const calculate = (data: {
  material_id: number;
  width: number;
  height: number;
  doors?: number;
  drawers?: number;
}) => api.post<CalculatorResult>('/calculator', data).then(r => r.data);

export const register = (data: { email: string; password: string; name: string }) =>
  api.post<{ token: string; user: User }>('/auth/register', data).then(r => r.data);

export const login = (data: { email: string; password: string }) =>
  api.post<{ token: string; user: User }>('/auth/login', data).then(r => r.data);

export const getProjects  = () => api.get<Project[]>('/projects').then(r => r.data);
export const getProject   = (id: number) => api.get<Project>(`/projects/${id}`).then(r => r.data);
export const createProject = (data: { name: string; config_json: string }) =>
  api.post<Project>('/projects', data).then(r => r.data);
export const updateProject = (id: number, data: { name: string; config_json: string }) =>
  api.put<Project>(`/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id: number) => api.delete(`/projects/${id}`);

export const createOrder = (data: Order) => api.post<Order>('/orders', data).then(r => r.data);

export const generatePreview = async (
  imageFile: File,
  materialColor: string,
  textureUrl?: string,
  opacity = 0.75,
): Promise<string> => {
  const form = new FormData();
  form.append('image', imageFile);
  form.append('material_color', materialColor);
  if (textureUrl) form.append('texture_url', textureUrl);
  form.append('opacity', String(opacity));

  const resp = await aiApi.post<{ image: string; mime_type: string }>(
    '/preview/base64',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return `data:${resp.data.mime_type};base64,${resp.data.image}`;
};
