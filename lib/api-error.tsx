export function handleApiError(
  error: unknown
) {
  console.error(error);

  return Response.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Internal Server Error",
    },
    {
      status: 500,
    }
  );
}