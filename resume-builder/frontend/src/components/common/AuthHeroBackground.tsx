/**
 * Shared gradient and animated orb background for Authentication Pages (Login & Register).
 * Extracted to reduce SonarQube code duplication.
 */
export function AuthHeroBackground() {
  return (
    <>
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      {/* Radial Gradient Base */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/20 to-slate-900 animate-slow-spin origin-center pointer-events-none"></div>

      {/* Modern Floating Orbs (Blob Animations) */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob pointer-events-none"></div>
      <div
        className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob pointer-events-none"
        style={{ animationDelay: "4s" }}
      ></div>
    </>
  );
}
