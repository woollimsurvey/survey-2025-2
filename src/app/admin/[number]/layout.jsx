import Link from "next/link";

export default function IndustryLayout({ children }) {
  return (
    <div className="mr-2">
      <header>
        <h1 className="m-4 text-3xl font-semibold">
          중분류별 핵심 데이터
        </h1>
      </header>
      <div className="flex gap-2">
        <aside className="w-[260px] shrink-0 rounded-lg border border-border bg-muted p-2">
          <nav className="flex flex-col gap-1">
            {[
              ["A", "전기수소차"],
              ["B", "자율주행차"],
              ["C", "친환경 스마트 조선해양플랜트"],
              ["D", "디지털 헬스케어"],
              ["E", "맞춤형 바이오 진단/치료"],
              ["F", "스마트 의료기기"],
              ["G", "스마트홈"],
              ["H", "지능형 로봇"],
              ["I", "디스플레이"],
              ["J", "지식서비스"],
              ["K", "뿌리기술"],
              ["L", "섬유의류"],
              ["M", "세라믹"],
              ["N", "화학공정소재"],
              ["O", "나노"],
              ["P", "탄소소재"],
              ["Q", "금속재료"],
              ["R", "차세대반도체"],
              ["S", "첨단제조공정장비"],
              ["T", "스마트 산업기계"],
              ["U", "차세대항공"],
              ["V", "이차전지"],
              ["W", "양자"],
            ].map(([code, label]) => (
              <Link
                key={code}
                href={`/admin/${code}`}
                className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        {children}
      </div>
    </div>
  );
}
