interface ErrorInput {
  message?: string;
  title?: string;
  cause?: string;
}

export const createError = ({
  message = 'Something seems to have gone wrong',
  title = 'Unknown Error',
  cause = 'unknown',
}: ErrorInput): Error => {
  const error = new Error(message, { cause: cause });
  error.name = title;
  return error;
};
