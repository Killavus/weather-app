type Validator = { (value: any): string | undefined };

export function required(message: string): Validator {
  return function (value) {
    if (value.toString().trim().length === 0) {
      return message;
    }

    return undefined;
  };
}

export function maxLength(limit: number, message: string): Validator {
  return function (value) {
    if (value.length > limit) {
      return message;
    }

    return undefined;
  };
}

export function validate(value: any, validators: Validator[]) {
  const validationResult = validators
    .map((validator) => validator(value))
    .filter(Boolean)
    .join(", ");

  if (validationResult === "") {
    return undefined;
  }

  return `${validationResult}.`;
}
