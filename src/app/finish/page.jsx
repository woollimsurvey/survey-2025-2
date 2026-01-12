export default function Finish() {
  return (
    <main className="relative mx-auto flex min-h-[calc(100dvh-2rem)] max-w-7xl items-center justify-center px-4 py-10">
      {/* Decorative layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="finish-blob finish-blob--a" />
        <div className="finish-blob finish-blob--b" />
        <div className="finish-blob finish-blob--c" />

        <div className="finish-dots" />

        <div className="finish-confetti">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="finish-confetti__piece" />
          ))}
        </div>
      </div>

      <section
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border bg-card/85 shadow-sm backdrop-blur"
        aria-labelledby="finish-title"
      >
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />

        <header className="relative px-6 pt-10 pb-6 sm:px-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
            <div className="finish-badge">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
              >
                <path
                  d="M20 7L10 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="mt-4 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              응답 제출 완료
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" aria-hidden />
              2025년 산업기술수준조사
            </p>

            <h1 id="finish-title" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              설문조사가 완료되었습니다
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              오랜 시간 성실히 응답해주셔서 감사합니다. 제출된 내용은 조사 목적에 따라 안전하게 활용됩니다.
            </p>
          </div>
        </header>

        <div className="relative px-6 pb-10 sm:px-10">
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <a
              href='about:blank'
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            >
              설문 종료
            </a>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            문의가 필요하시면 처음 화면의 <span className="font-medium text-foreground/80">조사문의</span> 안내를 참고해 주세요.
          </p>
        </div>
      </section>
    </main>
  );
}
