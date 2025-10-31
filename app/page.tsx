import ImageUpload from "@/components/ImageUpload";

export default function Home() {
  return (
    <main className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Notex</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Extract and organize notes from images with AI
          </p>
        </div>

        <ImageUpload />
      </div>
    </main>
  );
}
