/**
 * Shared gradient and animated orb background for Authentication Pages (Login & Register).
 * Extracted to reduce SonarQube code duplication.
 */
export function AuthHeroBackground() {
  return (
    <>
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/20 to-slate-900 animate-slow-spin origin-center pointer-events-none"></div>

      {/* Floating gradient orbs */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen filter blur-[64px] opacity-40 animate-pulse pointer-events-none"></div>
      <div
        className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-500 rounded-full mix-blend-screen filter blur-[64px] opacity-40 animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>
    </>
  );
}
