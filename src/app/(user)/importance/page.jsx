"use client";

import { useEffect, useState, Fragment } from "react";
import Form from "@/components/client-form";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SurveyFooter } from "@/components/survey/SurveyFooter";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useForm } from "@/contexts/FormContext";
import { supabase } from "@/libs/supabaseClient";
import Link from "next/link";
import { cn } from "@/libs/utils";
import { buildMeansByCode } from "@/libs/formStats";

export default function Importance() {
  const router = useRouter();

  const { userData, inputData, setInputData } = useForm();
  const [avgData, setAvgData] = useState();

  useEffect(() => {
    const fetchAvgData = async () => {
      if (!Array.isArray(userData) || userData.length === 0) return;

      const codes = [...new Set(userData.map((u) => u?.code).filter(Boolean))];
      if (codes.length === 0) return;

      const { data: rows, error } = await supabase
        .from("form")
        .select("code,importance")
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const meansByCode = buildMeansByCode(rows, ["importance"]);
      const metaByCode = Object.fromEntries(
        userData.map((u) => [u.code, { id: u.id, code: u.code }])
      );
      const merged = Object.fromEntries(
        codes.map((code) => [
          code,
          { ...(metaByCode[code] || { code }), ...(meansByCode?.[code] || {}) },
        ])
      );
      setAvgData(merged);
    };
    fetchAvgData();
  }, [userData]);

  const handleNext = (formData) => {
    const newInputData = [...inputData];
    formData.forEach((value, key) => {
      const [code, field] = key.split("_");
      const item = newInputData.find((item) => item.code === code);
      if (item) {
        item[field] = value;
      }
    });

    setInputData(newInputData);
    router.push("/urgency");
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
          2Q-4. (중요도)&nbsp;
          <span className="font-normal">
            선택하신 중분류별 하위 설명과 1차 응답 결과를 참고하시어 기술별 중요도를 제시해주시기 바랍니다.
          </span>
        </h4>
        <p className="ml-4">
          ※ ‘1차 응답값’은 귀하께서 1차 조사 당시 응답하신 값이며, ‘1차 평균값’은 귀하를 포함한 전체 응답자의 평균값으로 두 수치를 참고하여 2차 응답을 작성
        </p>
        <section className="my-4">
          <h5 className="my-2 text-center text-base font-semibold">
            &lt; 중요도 평가기준 및 평가방법 &gt;
          </h5>
          <div className="grid grid-cols-[auto_auto] border">
            <div className="border-r border-b bg-muted text-lg font-bold text-center leading-8">
              평가기준
            </div>
            <div className="border-b bg-muted text-lg font-bold text-center leading-8">
              평가방법
            </div>
            <div className="border-r p-4">
              (80점~100점) : 상위기술에 있어서 가장 중요한 비중을 차지
              <br />
              (60점~80점) : 상위기술에 있어서 매우 중요한 비중을 차지
              <br />
              (40점~60점) : 상위기술에 있어서 중요한 비중을 차지
              <br />
              (20점~40점) : 상위기술에 있어서 조금 중요한 비중을 차지
              <br />
              (20점 미만) : 중요하지 않음
            </div>
            <div className="flex justify-center items-center p-4">
              0~100 중 생각하는 중요도 수치를 기재(정수만 입력 가능)
            </div>
          </div>
        </section>
        <section className="border-t border-r border-l text-center">
          <article className="grid grid-cols-[4fr_1fr_1fr] border-b bg-muted text-lg font-bold">
            <div className="border-r leading-20">중분류</div>
            <div className="border-r border-b bg-muted font-bold leading-20">
              구분
            </div>
            <div className="border-b flex justify-center items-center">
              중요도
              <br />
              (0~100점)
            </div>
            {userData?.map((item) => (
              <Fragment key={item.id}>
                <ImportanceItem
                  item={inputData.find((i) => i.code === item.code) || { code: item.code }}
                  intermediate={item.intermediate}
                  type="2차 응답"
                />
                <ImportanceItem
                  item={item}
                  type="1차 응답값"
                />
                <ImportanceItem
                  item={{ ...avgData?.[item.code] }}
                  type="1차 평균값"
                />
              </Fragment>
            ))}
          </article>
        </section>
      </main>
      <SurveyFooter value={27} prevHref="/gap" />
    </Form>
  );
}

const ImportanceItem = ({ item, intermediate, type }) => {
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
      <div className="flex items-center border-b p-2 survey-input-cell">
        <>
          <Input
            type="number"
            step="1"
            min="0"
            max="100"
            aria-label="importance"
            name={`${item.code}_importance`}
            defaultValue={item.importance ?? ""}
            disabled={!intermediate}
            required={intermediate}
          />
          점
        </>
      </div>
    </article>
  );
};
