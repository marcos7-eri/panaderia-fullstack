import { ApiError } from '../errors/api-error';

export function parseId(value: string): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'El identificador debe ser un número entero positivo.');
  }

  return id;
}

export function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ApiError(400, `El campo ${field} es obligatorio.`);
  }

  return value.trim();
}

export function optionalText(value: unknown, field: string): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  if (typeof value !== 'string') {
    throw new ApiError(400, `El campo ${field} debe ser texto.`);
  }

  return value.trim();
}

export function optionalBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined) return undefined;

  if (typeof value !== 'boolean') {
    throw new ApiError(400, `El campo ${field} debe ser verdadero o falso.`);
  }

  return value;
}

export function positiveNumber(value: unknown, field: string): number {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    throw new ApiError(400, `El campo ${field} debe ser un número mayor que cero.`);
  }

  return number;
}

export function nonNegativeInteger(value: unknown, field: string): number {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    throw new ApiError(400, `El campo ${field} debe ser un entero mayor o igual que cero.`);
  }

  return number;
}

