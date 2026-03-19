import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador custom que verifica que al menos uno de los campos phone o email esté presente.
 * @param validationOptions Opciones de validación opcionales
 */
export function AtLeastOneContact(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneContact',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        /**
         * Valida que exista al menos phone o email.
         * @param _value Valor del campo decorado (no usado)
         * @param args Argumentos de validación con acceso al objeto completo
         * @returns true si phone o email tienen valor
         */
        validate(_value: unknown, args: ValidationArguments): boolean {
          const obj = args.object as { phone?: string; email?: string };
          return !!(obj.phone || obj.email);
        },
        /**
         * Mensaje por defecto cuando falla la validación.
         */
        defaultMessage(): string {
          return 'Debes proporcionar al menos teléfono o email.';
        },
      },
    });
  };
}
