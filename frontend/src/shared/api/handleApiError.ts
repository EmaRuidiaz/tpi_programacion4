import axios from 'axios';

interface ValidationErrorItem {
  msg?: string;
  loc?: Array<string | number>;
}

interface ApiErrorPayload {
  detail?: string | ValidationErrorItem[];
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => item.msg ?? 'Dato inválido')
        .join('. ');
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocurrió un error inesperado';
}
