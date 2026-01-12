"use client";

import { useEffect, useState, Fragment } from "react";
import Form from "@/components/client-form";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SurveyFooter } from "@/components/survey/SurveyFooter";

import { useForm } from "@/contexts/FormContext";
import { supabase } from "@/libs/supabaseClient";
import { cn } from "@/libs/utils";
import { buildModesByCode } from "@/libs/formStats";

export default function Availability() {
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
        .select("code,krAvailability,etcAvailability")
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const modeByCode = buildModesByCode(rows, ["krAvailability", "etcAvailability"]);
      setModeData(modeByCode);
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
      return !inputItem?.krAvailability || !inputItem?.etcAvailability;
    });

    if (hasError) {
      setError("모든 중분류에 대해 시장 활용성을 선택해주세요.");
      return;
    }

    setInputData(newInputData);
    router.push("/maturity");
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
        <h3 className="my-4 text-xl font-semibold">
          □ (시장성) 위원님께서 선택하신 중분류 기술들의 시장성(시장 활용성, 시장 성숙도)을 평가할 수 있는 하위 문항에 응답해주시기 바랍니다.
        </h3>
        <h4 className="text-xl font-semibold">
          2Q-10. (시장 활용성)&nbsp;
          <span className="font-normal">
            제시된 중분류별 가장 적합한 기술 활용성을 1차 응답 결과를 참고하여 국내와 국외로 구분하여 선택해주시기 바랍니다.
          </span>
        </h4>
        <p className="ml-4">
          ※ 시장 활용성 : 해당 분야의 산업 규모와 향후 시장 성장 가능성을 고려하여 산업 및 소비자 시장에서 제품·서비스로 구현되고 확산될 수 있는 현실적 가능성 <br />
          ※ ‘1차 응답값’은 귀하께서 1차 조사 당시 응답하신 값이며, ‘1차 최빈값’은 귀하를 포함한 전체 응답자께서 가장 많이 응답하신 값으로 두 값을 참고하여 2차 응답 선택
        </p>
        <section className="mt-4 border-t border-r border-l text-center">
          <article className="grid grid-cols-[3fr_1fr_1fr_2fr_2fr_2fr_2fr_2fr] border-b bg-muted text-lg font-bold">
            <div className="flex justify-center items-center border-r border-b">
              중분류
            </div>
            <div className="border-r border-b bg-muted font-bold content-center">
              국가 <br /> 구분
            </div>
            <div className="flex justify-center items-center border-r border-b p-1 text-lg">
              구분
            </div>
            <div className="flex justify-center items-center border-r border-b p-2">
              ① 전혀 없다
            </div>
            <div className="border-r border-b p-2">
              ② 낮은 편이다
              <br />
              (시장 제한,
              <br />
              경쟁력 낮음)
            </div>
            <div className="border-r border-b p-2">
              ③ 보통이다
              <br />
              (일부 시장
              <br />
              경쟁력을 보유)
            </div>
            <div className="border-r border-b p-2">
              ④ 높은 편이다
              <br />
              (국내외에서
              <br />
              활용 예정)
            </div>
            <div className="border-b p-2">
              ⑤ 매우 높다
              <br />
              (이미 국내외에서
              <br />
              활용 중)
            </div>
            {userData?.map((item) => (
              <Fragment key={item.id}>
                <AvailabilityItem
                  item={inputData.find((i) => i.code === item.code) || { code: item.code }}
                  intermediate={item.intermediate}
                  countryName="국내"
                  countryCode="kr"
                  fieldName="krAvailability"
                  type="2차 응답"
                />
                <AvailabilityItem
                  item={item}
                  countryCode="kr"
                  fieldName="krAvailability"
                  type="1차 응답값"
                />
                <AvailabilityItem
                  item={{
                    id: item.id,
                    code: item.code,
                    krAvailability: modeData?.[item.code]?.krAvailability,
                    etcAvailability: modeData?.[item.code]?.etcAvailability,
                  }}
                  countryCode="kr"
                  fieldName="krAvailability"
                  type="1차 최빈값"
                />
                <AvailabilityItem
                  item={inputData.find((i) => i.code === item.code) || { code: item.code }}
                  countryName="국외"
                  countryCode="etc"
                  fieldName="etcAvailability"
                  type="2차 응답"
                />
                <AvailabilityItem
                  item={item}
                  countryCode="etc"
                  fieldName="etcAvailability"
                  type="1차 응답값"
                />
                <AvailabilityItem
                  item={{
                    id: item.id,
                    code: item.code,
                    krAvailability: modeData?.[item.code]?.krAvailability,
                    etcAvailability: modeData?.[item.code]?.etcAvailability,
                  }}
                  countryCode="etc"
                  fieldName="etcAvailability"
                  type="1차 최빈값"
                />
              </Fragment>
            ))}
          </article>
        </section>
        <p className="text-left">
          * 국내 기술에 대해 국내시장과 국외시장에서의 활용성을 각각 평가해주시기 바랍니다.
        </p>
      </main>
      <SurveyFooter value={81} prevHref="/way" error={error} />
    </Form>
  );
}

const AvailabilityItem = ({ item, intermediate, countryName, countryCode, type, fieldName }) => {
  const modeKey =
    type === "1차 최빈값"
      ? `${item.code}-${fieldName}-${item[fieldName] ?? ""}`
      : undefined;
  const modeKeyProps = modeKey ? { key: modeKey } : {};

  return (
    <article className="contents">
      {intermediate && (
        <div className={cn(
          "border-b bg-primary p-2 text-sm font-bold text-primary-foreground whitespace-pre-line content-center",
          "row-span-6"
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
      {countryName && (
      <div className="flex justify-center items-center m-0 border-r border-b p-1 text-lg row-span-3">
        {countryName}
      </div>)}
      <div className="flex justify-center items-center border-r border-b text-lg font-bold">
        {type}
      </div>
      <RadioGroup
        {...modeKeyProps}
        name={`${item.code}_${fieldName}`}
        aria-label={fieldName}
        className="contents"
        defaultValue={item[fieldName]}
        disabled={!countryName}
      >
        <Label
          htmlFor={`${countryCode}1${item.code}${type}`}
          className="flex justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`${countryCode}1${item.code}${type}`} value="1" />
        </Label>
        <Label
          htmlFor={`${countryCode}2${item.code}${type}`}
          className="flex justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`${countryCode}2${item.code}${type}`} value="2" />
        </Label>
        <Label
          htmlFor={`${countryCode}3${item.code}${type}`}
          className="flex justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`${countryCode}3${item.code}${type}`} value="3" />
        </Label>
        <Label
          htmlFor={`${countryCode}4${item.code}${type}`}
          className="flex justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`${countryCode}4${item.code}${type}`} value="4" />
        </Label>
        <Label
          htmlFor={`${countryCode}5${item.code}${type}`}
          className="flex justify-center items-center m-0 border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`${countryCode}5${item.code}${type}`} value="5" />
        </Label>
      </RadioGroup>
    </article>
  );
};
