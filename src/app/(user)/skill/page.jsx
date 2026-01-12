"use client";

import { useEffect, useState, Fragment } from "react";
import Form from "@/components/client-form";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SurveyFooter } from "@/components/survey/SurveyFooter";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useForm } from "@/contexts/FormContext";
import { supabase } from "@/libs/supabaseClient";
import { countries } from "@/data/countries";
import Link from "next/link";
import { cn } from "@/libs/utils";
import { buildModesByCode } from "@/libs/formStats";

const questions = [
  {
    code: "1",
    name: "① 기초연구 단계(TRL 1~2)",
    description: [
      "TRL1 : 기초이론 또는 기초실험의 단계",
      "TRL2 : 실용을 목적으로 한 아이디어나 특허 등의 개념정립 단계",
    ],
  },
  {
    code: "2",
    name: "② 실험 단계(TRL 3~4)",
    description: [
      "TRL3 : 실험실 규모의 기본 성능을 검증하는 단계",
      "TRL4 : 실험실 규모의 소재·부품·시스템 핵심성능을 평가하는 단계",
    ],
  },
  {
    code: "3",
    name: "③ 시작품 단계(TRL 5~6)",
    description: [
      "TRL5 : 확정된 소재·부품·시스템의 시작품을 제작하고 성능을 평가하는 단계",
      "TRL6 : 파일럿 규모의 시작품을 제작하고 성능을 평가하는 단계",
    ],
  },
  {
    code: "4",
    name: "④ 실용화 단계(TRL 7~8)",
    description: [
      "TRL7 : 신뢰성 평가 및 수요기업을 평가하는 단계",
      "TRL8 : 시제품의 인증과 표준화를 수행하는 단계",
    ],
  },
  {
    code: "5",
    name: "⑤ 사업화 단계(TRL 9)",
    description: [
      "TRL9 : 본격적으로 제품을 양산하는 단계",
    ],
  },
]

export default function Skill() {
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
        .select("code,countrySkill,krSkill")
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const modeByCode = buildModesByCode(rows, ["countrySkill", "krSkill"]);
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

    const hasError = newInputData.some((item) => {
      if (!item?.countrySkill) {
        return true;
      }
      if (!item?.krSkill) {
        return true;
      }
      return false;
    });

    if (hasError) {
      setError("모든 중분류에 대해 기술성숙도를 선택해주세요.");
      return;
    }

    setInputData(newInputData);
    router.push("/independence");
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
          2Q-7. (기술성숙도)&nbsp;
          <span className="font-normal">
            아래 설명과 1차 응답 결과를 참고하시어 제시된 중분류별 최고기술국과 우리나라의 기술 성숙도를 선택해주시기 바랍니다.
          </span>
        </h4>
        <p className="ml-4">
          ※ 기술성숙도 : 특정 기술이 실제 제품이나 시스템에 적용되기 전, 기술의 성숙도를 객관적으로 평가하기 위한 9단계의 기준 <br />
          ※ ‘1차 응답값’은 귀하께서 1차 조사 당시 응답하신 값이며, ‘1차 최빈값’은 귀하를 포함한 전체 응답자께서 가장 많이 응답하신 값으로 두 값을 참고하여 2차 응답 선택
        </p>
        <section className="my-4">
          <h5 className="my-2 text-center text-base font-semibold">
            &lt; 기술성숙도 단계별 설명 &gt;
          </h5>
          <div className="grid grid-cols-[2fr_3fr] border">
            <div className="border-r border-b bg-muted text-lg font-bold text-center leading-8">
              기술성숙도 구분
            </div>
            <div className="border-b bg-muted text-lg font-bold text-center leading-8">
              설명
            </div>
            {questions.map(question => (
              <Fragment key={question.code}>
                <div className="flex justify-center items-center border-r border-b">
                  {question.name}
                </div>
                <div className="border-b pl-6">
                  <ul className="list-disc">
                    {question.description.map((description, index) => (<li key={index}>{description}</li>))}
                  </ul>
                </div>
              </Fragment>
            ))}
          </div>
        </section>
        <section className="mt-4 border-t border-r border-l text-center">
          <article className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted text-lg font-bold">
            <div className="flex justify-center items-center border-r border-b row-span-2">
              중분류
            </div>
            <div className="flex justify-center items-center border-r border-b row-span-2">
              국가 구분
            </div>
            <div className="flex justify-center items-center border-r border-b row-span-2">
              구분
            </div>
            <div className="col-span-5 border-b p-2">기술성숙도</div>
            {questions.map(question => (
              <div key={question.code} className="border-r border-b p-2 content-center">
                {question.name}
              </div>
            ))}
            {userData?.map((item) => {
              const inputItem = inputData.find((i) => i.code === item.code) || { code: item.code };
              const inputCountry = inputData.find((i) => i.code === item.code)?.country || item.country;
              const countryName = [...countries, { code: "etc", name: "기타" }]
                .find(country => country.code === inputCountry)?.name || "";
              const fullCountryName = inputCountry === "eu" 
                ? countryName + (inputItem.euName ? `\n(${inputItem.euName})` : "")
                : inputCountry === "etc"
                ? countryName + (inputItem.etcName ? `\n(${inputItem.etcName})` : "")
                : countryName;

              return (
                <Fragment key={item.id}>
                  <SkillItem
                    fieldName="countrySkill"
                    item={inputItem}
                    intermediate={item.intermediate}
                    country="최고기술국"
                    countryCode={inputCountry}
                    type="2차 응답"
                  />
                  <SkillItem
                    fieldName="countrySkill"
                    item={item}
                    type="1차 응답값"
                  />
                  <SkillItem
                    fieldName="countrySkill"
                    item={{
                      id: item.id,
                      code: item.code,
                      countrySkill: modeData?.[item.code]?.countrySkill,
                      krSkill: modeData?.[item.code]?.krSkill,
                    }}
                    type="1차 최빈값"
                  />
                  <SkillItem
                    fieldName="krSkill"
                    item={inputItem}
                    country='한국'
                    countryCode="kr"
                    type="2차 응답"
                  />
                  <SkillItem
                    fieldName="krSkill"
                    item={item}
                    type="1차 응답값"
                  />
                  <SkillItem
                    fieldName="krSkill"
                    item={{
                      id: item.id,
                      code: item.code,
                      countrySkill: modeData?.[item.code]?.countrySkill,
                      krSkill: modeData?.[item.code]?.krSkill,
                    }}
                    type="1차 최빈값"
                  />
                </Fragment>
              );
            })}
          </article>
        </section>
        <p>
          * 최고기술국의 중분류 기술 성숙도, 한국의 중분류 기술 성숙도를 각각
          평가해주시기 바랍니다.
        </p>
      </main>
      <SurveyFooter value={54} prevHref="/effect" error={error} />
    </Form>
  );
}

const SkillItem = ({ fieldName, item, intermediate, country, countryCode, type }) => {
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
      {country && (
      <div className="flex justify-center items-center border-r border-b text-lg font-bold row-span-3 whitespace-pre-line">
        {country}
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
        disabled={!countryCode}
      >
        {questions.map(question => (
          <Label
            key={question.code}
            htmlFor={`coun${question.code}${item.code}${type}${fieldName}`}
            className="flex w-full justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
          >
            <RadioGroupItem id={`coun${question.code}${item.code}${type}${fieldName}`} value={question.code} />
          </Label>
        ))}
      </RadioGroup>
    </article>
  );
};
