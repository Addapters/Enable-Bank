export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" role="status" aria-label="A carregar..." />
    </div>
  );
}
