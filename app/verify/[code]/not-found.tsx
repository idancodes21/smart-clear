export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">

        <h1 className="text-4xl font-bold text-red-600">
          ❌ Invalid Certificate
        </h1>

        <p className="mt-3 text-gray-600">
          The verification code does not exist.
        </p>

      </div>
    </main>
  );
}