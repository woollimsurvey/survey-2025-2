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

export default function Urgency() {
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
        .select("code,urgency")
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const modeByCode = buildModesByCode(rows, ["urgency"]);
      const flat = Object.fromEntries(
        Object.entries(modeByCode || {}).map(([code, v]) => [code, v?.urgency])
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
      return !inputItem?.urgency;
    });

    if (hasError) {
      setError("모든 중분류에 대해 시급성을 선택해주세요.");
      return;
    }

    setInputData(newInputData);
    router.push("/effect");
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
          2Q-5. (시급성)&nbsp;
          <span className="font-normal">
            1차 응답 결과를 참고하시어 제시된 중분류별 가장 적합한 시급성 정도를 선택해주시기 바랍니다.
          </span>
        </h4>
        <p className="ml-4">
          ※ 시급성 : 특정 기술분야 또는 상위 기술을 개발하고 산업화하기 위해 해당 중분류 기술이 시급히 개발되어야 하는 정도 <br />
          ※ ‘1차 응답값’은 귀하께서 1차 조사 당시 응답하신 값이며, ‘1차 최빈값’은 귀하를 포함한 전체 응답자께서 가장 많이 응답하신 값으로 두 값을 참고하여 2차 응답 선택
        </p>
        <section className="my-4 border-t border-r border-l text-center">
          <article className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted text-lg font-bold">
            <div className="flex justify-center items-center border-r border-b">
              중분류
            </div>
            <div className="border-r border-b bg-muted font-bold leading-20">
              구분
            </div>
            <div className="border-r border-b p-2 content-center">① 전혀 시급하지 않다</div>
            <div className="border-r border-b p-2 content-center">② 시급하지 않다</div>
            <div className="border-r border-b p-2 content-center">③ 보통이다</div>
            <div className="border-r border-b p-2 content-center">④ 시급하다</div>
            <div className="border-b p-2 content-center">⑤ 매우 시급하다</div>
            {userData?.map((item) => (
              <Fragment key={item.id}>
                <UrgencyItem
                  item={inputData.find((i) => i.code === item.code) || { code: item.code }}
                  intermediate={item.intermediate}
                  type="2차 응답"
                />
                <UrgencyItem
                  item={item}
                  type="1차 응답값"
                />
                <UrgencyItem
                  item={{ id: item.id, code: item.code, urgency: modeData?.[item.code] }}
                  type="1차 최빈값"
                />
              </Fragment>
            ))}
          </article>
        </section>
      </main>
      <SurveyFooter value={36} prevHref="/importance" error={error} />
    </Form>
  );
}

const UrgencyItem = ({ item, intermediate, type }) => {
  const modeKey =
    type === "1차 최빈값" ? `${item.code}-urgency-${item.urgency ?? ""}` : undefined;
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
        name={`${item.code}_urgency`}
        aria-label="urgency"
        className="contents"
        defaultValue={item.urgency}
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
