export const createHttpException = (
    status: number,
    message: string,
    stack = "",
    errors: string[] = []
  ) => {
    const error = new Error(message) as Error & { status: number; errors: string[] };
    error.name = "HttpException";
    error.status = status || 500;
    error.errors = errors;
    error.stack = stack;
    return error;
  };
  