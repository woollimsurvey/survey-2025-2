"use client";

import { useEffect, useState, Fragment } from "react";
import Form from "@/components/client-form";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SurveyFooter } from "@/components/survey/SurveyFooter";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { useForm } from "@/contexts/FormContext";
import { supabase } from "@/libs/supabaseClient";
import { countries } from "@/data/countries";
import { patentFields } from "@/data/code";
import { cn } from "@/libs/utils";
import { buildMeansByCode } from "@/libs/formStats";

export default function Level() {
  const router = useRouter();

  const { userData, inputData, setInputData } = useForm();
  const [avgData, setAvgData] = useState();
  const [patentData, setPatentData] = useState();

  const handleNext = (formData) => {
    const newInputData = [...inputData];
    formData.forEach((value, key) => {
      const [code, field] = key.split("_");
      newInputData.find((item) => item.code === code)[field] = value;
    });
    setInputData(newInputData);

    router.push("/gap");
  };

  useEffect(() => {
    const fetchAvgData = async () => {
      if (!Array.isArray(userData) || userData.length === 0) return;
      const codes = [...new Set(userData.map((u) => u?.code).filter(Boolean))];
      if (codes.length === 0) return;

      const fields = countries.map((c) => `${c.code}Per`);
      const { data: rows, error } = await supabase
        .from("form")
        .select(`code,${fields.join(",")}`)
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const meansByCode = buildMeansByCode(rows, fields);
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

    const fetchPatentData = async () => {
      if (!Array.isArray(userData) || userData.length === 0) return;

      const codes = [...new Set(userData.map((u) => u?.code).filter(Boolean))];
      if (codes.length === 0) return;

      const fields = patentFields.flatMap((field) =>
        countries.map((country) => `${country.code}${field.name}`)
      );

      const { data: rows, error } = await supabase
        .from("industry")
        .select(`code,${fields.join(",")}`)
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const countryCodeToName = Object.fromEntries(
        countries.map((c) => [c.code, c.name])
      );
      const patentRankingByCode = {};

      for (const row of rows || []) {
        const code = row.code;
        const codeResult = {};

        for (const field of patentFields) {
          const fieldValues = countries.map((country) => {
            const col = `${country.code}${field.name}`;
            return {
              code: country.code,
              name: countryCodeToName[country.code],
              value: row[col],
            };
          });

          fieldValues.sort((a, b) => {
            if (a.value == null) return 1;
            if (b.value == null) return -1;
            return a.value - b.value;
          });

          const rankingStr = fieldValues
            .filter((x) => x.value != null)
            .map((x) => x.name)
            .join(" > ");

          codeResult[field.name] = rankingStr;
        }

        patentRankingByCode[code] = codeResult;
      }

      setPatentData(patentRankingByCode);
    };

    fetchAvgData();
    fetchPatentData();
  }, [userData]);

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
          2Q-2. (최고기술국 대비 기술수준)&nbsp;
          <span className="font-normal">
            1차 응답 결과를 참고하시어 제시된 중분류 기술별 최고기술국 대비 상대적 기술수준을 제시해주시기 바랍니다.
          </span>
        </h4>
        <p className="ml-4">
          ※ 현재 제시된 최고기술 보유국은 귀하께서 2차 설문 진행 시, 2Q-1(최고기술 보유국)에서 응답한 최고기술 보유국 <br />
          ※ ‘1차 응답값’은 귀하께서 1차 조사 당시 응답하신 값이며, ‘1차 평균값’은 귀하를 포함한 전체 응답자의 평균값으로 두 수치를 참고하여 2차 응답을 작성 <br />
          ※ 국가별 특허 순위<span className="text-destructive">(!)</span>에 마우스를 올리면 5가지 지표별 국가 순위를 확인하실 수 있습니다.
        </p>
        <section className="border-t border-r border-l text-center mt-4">
          <article className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] text-lg">
            <div className="border-r border-b bg-muted font-bold leading-20">
              중분류
            </div>
            <div className="flex justify-center items-center border-r border-b bg-muted font-bold">
              최고기술
              <br />
              보유국
            </div>
            <div className="border-r border-b bg-muted font-bold leading-20">
              구분
            </div>
            {countries.map(country => (
              <div key={country.code} className="border-r border-b bg-muted font-bold leading-20">
                {country.name}
              </div>
            ))}
            {userData
              ?.map((item) => {
                const inputCountry = inputData.find(input => input.code === item.code)?.country;
                const strCountry = [...countries, { code: "etc", name: "기타" }]
                  .find(country => country.code === inputCountry)?.name +
                    (inputCountry === "eu" || inputCountry === "etc" ? `\n(${inputData.find(input => input.code === item.code)?.[inputCountry + "Name"]})` : "");
                const inputItem = inputData.find(data => data.code === item.code);
                inputItem[inputItem.country + 'Per'] = '100';
                return (
                  <Fragment key={item.id}>
                    <LevelItem
                      item={inputItem}
                      intermediate={item.intermediate}
                      country={strCountry}
                      type="2차 응답"
                    />
                    <LevelItem item={item} type='1차 응답값' />
                    <LevelItem
                      item={{ ...avgData?.[item.code] }}
                      type='1차 평균값'
                    />
                    <div className="col-span-full border-b-2 text-left">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-2 inline-block">
                              ※ 국가별 특허 순위{" "}
                              <span className="text-destructive">(!)</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="grid grid-cols-[auto_auto] text-center text-sm">
                            <div className="p-1 bg-primary text-primary-foreground">구분</div>
                            <div className="p-1 bg-primary text-primary-foreground">
                              국가별 특허 순위
                            </div>
                            {patentFields.map((field) => (
                              <Fragment key={field.name}>
                                <div className="px-1">{field.desc}</div>
                                <div className="px-1">
                                  {patentData?.[item.code]?.[field.name]}
                                </div>
                              </Fragment>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Fragment>
                )
              })}
          </article>
        </section>
        <p>
          ※ 최고기술 보유국을 제외한 나머지 국가의 기술수준을 제시
        </p>
      </main>
      <SurveyFooter value={9} prevHref="/country" />
    </Form>
  );
}

const LevelItem = ({ item, intermediate, country, type }) => {
  return (
    <article
      key={item.id}
      className="contents"
    >
      {intermediate && <>
      <div className={cn(
        "border-b bg-primary p-2 text-sm font-bold text-primary-foreground whitespace-pre-line content-center",
        intermediate ? "row-span-3" : ""
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
                <button type="button" className="text-destructive">
                  (!)
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className={cn("flex justify-center items-center border-r border-b text-lg font-bold whitespace-pre-line", intermediate ? "row-span-3" : "")}>
        {country}
      </div>
      </>}
      <div className="flex justify-center items-center border-r border-b text-lg font-bold">
        {type}
      </div>
      {countries.map(country => (
        <div key={country.code} className="flex items-center border-r border-b p-2 survey-input-cell">
          <>
            <Input
              type="number"
              step="1"
              min="0"
              max={item.country === country.code ? 100 : 99}
              aria-label={`${country.code}Per`}
              name={`${item.code}_${country.code}Per`}
              defaultValue={item?.[`${country.code}Per`] ?? ""}
              disabled={item.country === country.code || !intermediate}
              required={!!intermediate}
            />
            %
          </>
        </div>
      ))}
    </article>
  )
}