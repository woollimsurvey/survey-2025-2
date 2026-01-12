"use client";

import { useEffect, useState, Fragment } from "react";
import Form from "@/components/client-form";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SurveyFooter } from "@/components/survey/SurveyFooter";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useForm } from "@/contexts/FormContext";
import { supabase } from "@/libs/supabaseClient";
import { cn } from "@/libs/utils";
import { buildModesByCode } from "@/libs/formStats";

export default function Independence() {
  const router = useRouter();

  const { userData, inputData, setInputData } = useForm();
  const [error, setError] = useState("");
  const [modeData, setModeData] = useState();

  useEffect(() => {
    const fetchModeData = async () => {
      if (!Array.isArray(userData) || userData.length === 0) return;

      const codes = [...new Set(userData.map((u) => u?.code).filter(Boolean))];
      if (codes.length === 0) return;

      const { data: rows, error } = await supabase
        .from("form")
        .select("code,independence")
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const modeByCode = buildModesByCode(rows, ["independence"]);
      const flat = Object.fromEntries(
        Object.entries(modeByCode || {}).map(([code, v]) => [code, v?.independence])
      );
      setModeData(flat);
    };
    fetchModeData();
  }, [userData]);

  const handleNext = (formData) => {
    setError("");
    const newInputData = [...inputData];
    formData.forEach((value, key) => {
      const [code, field] = key.split("_");
      const item = newInputData.find((item) => item.code === code);
      if (item) {
        item[field] = value;
      }
    });

    const hasError = userData.some((item) => {
      const inputItem = newInputData.find((i) => i.code === item.code);
      return !inputItem?.independence;
    });

    if (hasError) {
      setError("모든 중분류에 대해 기술 자립도를 선택해주세요.");
      return;
    }

    setInputData(newInputData);
    router.push(`/way`);
  };

  return (
    <Form action={handleNext}>
      <header className="flex items-center gap-4 mb-3 rounded-lg bg-muted/60 p-3 shadow-sm ring-1 ring-border/50 backdrop-blur">
        <Badge className="align-middle">2</Badge>
        <h2 className="text-2xl font-semibold">
          기술수준조사
        </h2>
      </header>
      <main>
        <h4 className="text-xl font-semibold">
          2Q-8. (기술 자립도)&nbsp;
          <span className="font-normal">
            아래 설명과 1차 응답 결과를 참고하시어 제시된 중분류별로 5개의 항목 중 기술 자립도에 가장 적합한 구분자를 선택해주시기 바랍니다.
          </span>
        </h4>
        <p className="ml-4">
          ※ 기술 자립도 : 해외 기술 의존도 대비 국내 기술 자립 수준 <br />
          ※ ‘1차 응답값’은 귀하께서 1차 조사 당시 응답하신 값이며, ‘1차 최빈값’은 귀하를 포함한 전체 응답자께서 가장 많이 응답하신 값으로 두 값을 참고하여 2차 응답 선택
        </p>
        <section className="my-4">
          <h5 className="my-2 text-center text-base font-semibold">
            &lt; 기술 자립도 설명 &gt;
          </h5>
          <div className="grid grid-cols-[1fr_1fr] border text-center">
            <div className="border-r border-b bg-muted text-lg font-bold leading-8">
              기술 자립도 구분
            </div>
            <div className="border-b bg-muted text-lg font-bold leading-8">
              설명
            </div>
            <div className="border-r border-b">
              ① 해외 기술 의존도가 매우 높음
              <br />
              (국내 자립도가 매우 낮음)
            </div>
            <div className=" border-b leading-12">
              <strong className="font-semibold">국내 단독 개발·생산·운영 불가</strong>
            </div>
            <div className="border-r border-b">
              ② 해외 기술 의존도가 높음
              <br />
              (국내 자립도가 낮음)
            </div>
            <div className="border-b leading-12">
              <strong className="font-semibold">해외 기술 없이 제한적으로 운영 가능</strong>
            </div>
            <div className="border-r border-b leading-12">
              ③ 해외·국내 기술 의존도가 비슷함
            </div>
            <div className="border-b leading-12">
              <strong className="font-semibold">
                핵심 요소 일부는 국내 내재화가 되어 있으나, 일부는 해외에 의존
              </strong>
            </div>
            <div className="border-r border-b">
              ④ 국내 기술 자립도가 높음
              <br />
              (해외 기술 보조적으로만 활용)
            </div>
            <div className="border-b leading-12">
              <strong className="font-semibold">핵심기술 대부분을 국내에서 제작·운영 가능</strong>
            </div>
            <div className="border-r">
              ⑤ 국내 독자적 기술 자립도가 매우 높음
              <br />
              (해외 의존도 거의 없음)
            </div>
            <div className="leading-12">
              <strong className="font-semibold">국내 공급만으로 안정적 생산/서비스 가능</strong>
            </div>
          </div>
        </section>
        <section className="border-t border-r border-l text-center">
          <article className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-muted text-lg font-bold">
            <div className="flex justify-center items-center border-r border-b row-span-2">
              중분류
            </div>
            <div className="border-r border-b bg-muted font-bold row-span-2 content-center">
              구분
            </div>
            <div className="col-span-5 border-b p-2">기술 자립도</div>
            <div className="border-r border-b p-2 content-center">
              ① 해외 기술
              <br />
              의존도가 매우 높음
            </div>
            <div className="border-r border-b p-2 content-center">
              ② 해외 기술
              <br />
              의존도가 높음
            </div>
            <div className="border-r border-b p-2 content-center">
              ③ 해외·국내 기술
              <br />
              의존도가 비슷함
            </div>
            <div className="border-r border-b p-2 content-center">
              ④ 국내 기술
              <br />
              자립도가 높음
            </div>
            <div className="border-b p-2 content-center">
              ⑤ 국내 독자적 기술
              <br />
              자립도가 매우 높음
            </div>
            {userData?.map((item) => (
              <Fragment key={item.id}>
                <IndependenceItem
                  item={inputData.find((i) => i.code === item.code) || { code: item.code }}
                  intermediate={item.intermediate}
                  type="2차 응답"
                />
                <IndependenceItem
                  item={item}
                  type="1차 응답값"
                />
                <IndependenceItem
                  item={{ id: item.id, code: item.code, independence: modeData?.[item.code] }}
                  type="1차 최빈값"
                />
              </Fragment>
            ))}
          </article>
        </section>
      </main>
      <SurveyFooter value={63} prevHref="/skill" error={error} />
    </Form>
  );
}

const IndependenceItem = ({ item, intermediate, type }) => {
  const modeKey =
    type === "1차 최빈값"
      ? `${item.code}-independence-${item.independence ?? ""}`
      : undefined;
  const modeKeyProps = modeKey ? { key: modeKey } : {};

  return (
    <article className="contents">
      {intermediate && (
        <div className={cn(
          "border-b bg-primary p-2 text-sm font-bold text-primary-foreground whitespace-pre-line content-center",
          "row-span-3"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  {intermediate.split(" ").reduce((acc, word, index) => {
                    acc +=
                      (index + 1) % 3 === 0
                        ? `${word}${
                            index !== intermediate.split(" ").length - 1
                              ? "\n"
                              : "\t"
                          }`
                        : `${word}\t`;

                    return acc;
                  }, "")}
                  {intermediate && (
                    <span type="button" className="text-destructive">
                      (!)
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              {intermediate && (
                <TooltipContent>
                  <p>{item.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <div className="flex justify-center items-center border-r border-b text-lg font-bold">
        {type}
      </div>
      <RadioGroup
        {...modeKeyProps}
        name={`${item.code}_independence`}
        aria-label="independence"
        className="contents"
        defaultValue={item.independence}
        disabled={!intermediate}
      >
        <Label
          htmlFor={`1${item.code}${type}`}
          className="flex justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`1${item.code}${type}`} value="1" />
        </Label>
        <Label
          htmlFor={`2${item.code}${type}`}
          className="flex justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`2${item.code}${type}`} value="2" />
        </Label>
        <Label
          htmlFor={`3${item.code}${type}`}
          className="flex justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`3${item.code}${type}`} value="3" />
        </Label>
        <Label
          htmlFor={`4${item.code}${type}`}
          className="flex justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`4${item.code}${type}`} value="4" />
        </Label>
        <Label
          htmlFor={`5${item.code}${type}`}
          className="flex justify-center items-center m-0 border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`5${item.code}${type}`} value="5" />
        </Label>
      </RadioGroup>
    </article>
  );
};
