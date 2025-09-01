export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'attendee';
  created_at: string;
  updated_at?: string;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  created_at: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'attendee';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}
