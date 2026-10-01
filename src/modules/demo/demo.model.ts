import { ObjectId } from "mongodb";

export interface Demo {
    _id?: ObjectId;
    name: string;
    description: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Datos que el cliente puede enviar sobre un demo.
 * Todos los campos son opcionales; el servicio valida qué es
 * obligatorio según la operación (crear vs. actualizar).
 */
export interface DemoDTO {
    name?: string;
    description?: string;
    active?: boolean;
}
