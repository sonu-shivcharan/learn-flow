import { GetStartedButton } from "@/components/GetStartedButton";

export default async function HomePage() {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to <span className="text-blue-600">LearnFlow</span>
        </h1>
        <p className="text-lg text-zinc-500 max-w-[600px] mx-auto">
          Your personalized e-learning journey starts here. AI-driven pathways, immersive lessons, and dynamic tracking.
        </p>
        <div>
          <GetStartedButton />
        </div>
      </div>
    </div>
  );
}
