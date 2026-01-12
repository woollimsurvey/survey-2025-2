"use client";

import { use } from "react";
import Form from "@/components/client-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

import { useForm } from "@/contexts/FormContext";
import { Card } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();

  const { agree, setAgree } = useForm();

  const handleNext = () => {
    if (agree !== "yes") {
      toast.error([
        "본 설문은 개인정보 수집 및 이용에 대한 동의가 있어야만 참여가 가능합니다.",
        "현재 ‘미동의’를 선택하셨기 때문에 설문이 진행되지 않습니다.",
        "다시 참여를 원하시면 첫 페이지로 돌아가 동의 후 설문을 진행해 주시기 바랍니다."
      ].join("\n"));

      return;
    }

    router.push("/basic");
  };

  return (
    <Form action={handleNext}>
      <Card className="m-8">
        <header className="text-center py-6 my-6 bg-background/60 rounded-lg shadow-sm ring-1 ring-border/50 backdrop-blur">
          <h1 className="text-4xl font-semibold">
            2025년 산업기술수준조사
          </h1>
        </header>
        <main className="p-4">
          <article>
            <p>
              안녕하십니까? <br />
              <br />
              한국산업기술기획평가원(KEIT)에서는 2025년 산업기술수준조사를 수행 중이며, 본 조사는 1차 델파이 조사에 이은 2차 조사에 해당합니다. <br />
              <br />
              우선, 앞서 1차 델파이 조사에 적극 참여해 주심에 감사의 말씀을 드리오며, 1차 응답 결과를 바탕으로 아래와 같이 2차 조사를 진행하고자 하오니 바쁘시더라도 잠시 시간을 내주시어 참여를 부탁드리겠습니다.
            </p>
            <p className="ml-2 indent-1 text-sm font-semibold">
              ※ 본 2차 델파이 조사까지 성실히 응답해주신 분들께 소정의 기프티콘을 지급해드릴 예정입니다.
            </p>
            <br />
            <p className="mt-2">
              ㅇ <strong className="font-semibold">({`조사 방법`})</strong>{" "}
              아래 사항들을 참고하시어 답변 부탁드립니다.
            </p>
            <div className="ml-4">
              <p>1) 귀하의 성함과 핸드폰 번호를 입력해주시기 바랍니다.</p>
              <p className="ml-2 indent-1 text-sm font-semibold">
                ※ 입력하신 개인정보에 따라 1차에 응답한 결과값이 연동되오니 착오 없이 기재해주시기 바랍니다.
              </p>
              <p>
                2) 2023년도 기술수준조사 결과와 2025년 특허 분석 결과 참고 <br />
                3) 질문별 1차 응답 결과(귀하께서 1차 조사 당시 응답하신 값, 전체 응답자 평균값) 참고 <br />
                4) 2)와 3)을 고려하여 질문에 대한 2차 응답값 제시 <br />
              </p>
            </div>
            <p className="mt-2">
              ㅇ <strong className="font-semibold">({`조사 일정`})</strong>{" "}
              1월 00일(월) ~ 1월 00일(월)
            </p>
          </article>
          <article className="rounded-lg bg-muted p-6">
            <p>
              동 조사의 응답 결과는 조사목적을 위해서만 활용될 예정이며, 개인정보보호법 제15조(개인정보 수집․이용) 및 통계법 제33조(비밀의 보호 등)에 의거하여 개인정보 수집·이용에 대해 아래와 같이 안내드리오니 확인하여 주시기 바랍니다.
            </p>
            <p className="text-sm pl-4 my-2">
              ㅇ 개인정보의 수집 이용 목적 : 2025년 산업기술수준조사<br />
              ㅇ 수집하려는 개인정보의 필수 항목 : 성명, 휴대전화번호<br />
              ㅇ 개인정보의 보유 및 이용 기간 : 2025년 산업기술수준조사 완료시까지<br />
              ※ 개인정보보호법에 의거하여 개인정보 수집 및 이용에 따른 동의를 거부할 수 있으나, 동의를 거부할 경우 조사 참여가 제한됨을 안내드립니다.
            </p>
            <div className="flex justify-evenly mt-3 border p-1">
              <p>
                개인정보의 수집 및 이용에 동의하십니까?
              </p>
              <RadioGroup
                aria-label="agree"
                className="flex items-center gap-8"
                value={agree}
                onValueChange={setAgree}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="agree-yes" value="yes" />
                  <Label htmlFor="agree-yes">동의함</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="agree-no" value="no" />
                  <Label htmlFor="agree-no">동의하지 않음</Label>
                </div>
              </RadioGroup>
            </div>
          </article>
          <p className="my-2 text-center">
            {new Date().toISOString().slice(0, 10).replace(/-/g, '. ') + '.'}
          </p>
          <p>
            ㅇ <strong className="font-semibold">주관기관</strong> : 한국산업기술기획평가원(KEIT) <br />
            ㅇ <strong className="font-semibold">조사수행</strong> : ㈜전략울림 <br />
            ㅇ <strong className="font-semibold">조사문의</strong>
          </p>
          <p className="ml-4">
            - ㈜전략울림 김진현 선임(kjhjs2080@woollimi.com)
          </p>
        </main>
        <footer className="my-6 text-center">
          <Button type="submit">설문조사 시작</Button>
        </footer>
      </Card>
    </Form>
  );
}
