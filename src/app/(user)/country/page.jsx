"use client";

import { useState, useEffect, Fragment } from "react";
import Form from "@/components/client-form";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SurveyFooter } from "@/components/survey/SurveyFooter";

import { useForm } from "@/contexts/FormContext";
import { supabase } from "@/libs/supabaseClient";
import Link from "next/link";
import { countries } from "@/data/countries";
import { major, patentFields } from "@/data/code";
import { analyzePdf, pastPdf } from "@/data/pdf";
import { FileChartColumn } from "lucide-react";
import { toast } from "sonner";

export default function Country() {
  const router = useRouter();

  const {
    userData,
    inputData,
    setInputData,
  } = useForm();
  const [data, setData] = useState(() =>
    Array.isArray(inputData) ? [...inputData] : []
  );

  const [error, setError] = useState("");
  const [modeData, setModeData] = useState();
  const [patentData, setPatentData] = useState();

  const majorKeys = Array.from(
    new Set(
      (userData || [])
        .map((u) => (u?.code ? String(u.code).trim().charAt(0) : ""))
        .filter(Boolean)
    )
  ).sort();

  const downloadFromPublic = (path) => {
    if (!path) return;
    const a = document.createElement("a");
    a.href = path;
    a.setAttribute("download", "");
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  useEffect(() => {
    const fetchModeData = async () => {
      if (!Array.isArray(userData) || userData.length === 0) return;

      const codes = [...new Set(userData.map((u) => u?.code).filter(Boolean))];
      if (codes.length === 0) return;

      const { data: rows, error } = await supabase
        .from("form")
        .select("code,country")
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      // 동률 시에도 화면이 흔들리지 않도록 우선순위를 고정
      const priority = ["kr", "us", "cn", "jp", "eu", "etc"];

      const countsByCode = (rows || []).reduce((acc, row) => {
        if (!row?.code || !row?.country) return acc;
        acc[row.code] ??= {};
        acc[row.code][row.country] = (acc[row.code][row.country] || 0) + 1;
        return acc;
      }, {});

      const modeByCode = codes.reduce((acc, code) => {
        const counts = countsByCode[code] || {};
        let bestCountry = undefined;
        let bestCount = -1;

        for (const c of priority) {
          const n = counts[c] || 0;
          if (n > bestCount) {
            bestCount = n;
            bestCountry = c;
          }
        }

        acc[code] = bestCount > 0 ? bestCountry : undefined;
        return acc;
      }, {});

      setModeData(modeByCode);
    };

    const fetchPatentData = async () => {
      if (!Array.isArray(userData) || userData.length === 0) return;

      const codes = [...new Set(userData.map((u) => u?.code).filter(Boolean))];
      if (codes.length === 0) return;
      
      const fields = patentFields.flatMap(field => countries.map(country => `${country.code}${field.name}`));

      const { data: rows, error } = await supabase
        .from("industry")
        .select(`code,${fields.join(',')}`)
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const countryCodeToName = Object.fromEntries(countries.map(c => [c.code, c.name]));
      const patentRankingByCode = {};

      for (const row of rows) {
        const code = row.code;
        const codeResult = {};

        for (const field of patentFields) {
          const fieldValues = countries.map(country => {
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
            .filter(x => x.value != null)
            .map(x => x.name)
            .join(" > ");

          codeResult[field.name] = rankingStr;
        }

        patentRankingByCode[code] = codeResult;
      }

      setPatentData(patentRankingByCode);
    };
    fetchModeData();
    fetchPatentData();
  }, [userData]);

  const handleChange = (code, key, value) => {
    setData(
      data.map((prev) => {
        if (prev.code === code) {
          return { ...prev, [key]: value };
        }

        return prev;
      })
    );
  };

  const handleNext = (formData) => {
    setError("");
    if (!data.every((inter) => !!inter?.country)) {
      setError("모든 중분류에 대해 최고기술 보유국을 선택해주세요.");

      return;
    }

    const newInputData = [...inputData];
    formData.forEach((value, key) => {
      const [code, field] = key.split("_");
      newInputData.find((item) => item.code === code)[field] = value;
    });
    setInputData(newInputData.map(item => ({
      ...item,
      euName: item.country === "eu" ? item.euName : "",
      etcName: item.country === "etc" ? item.etcName : "",
    })));

    router.push("/level");
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
        <section className="grid grid-cols-[1fr_auto] border text-center bg-border gap-px">
          <div className="text-lg font-bold bg-muted content-center">
            과년도(2023년)에 수행된 기술수준조사 결과를 다운받아 응답 시 참고해주시기 바랍니다.
          </div>
          <div className="bg-muted p-4">
            <div className="bg-card p-4 text-xl font-bold">
              과년도 조사결과 다운로드
            </div>
            <div className="p-2 border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button color="red" type="button">
                    PDF 파일
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {majorKeys.length === 0 ? (
                    <DropdownMenuItem disabled>
                      다운로드 가능한 자료가 없습니다
                    </DropdownMenuItem>
                  ) : (
                    majorKeys.map((k) => (
                      <DropdownMenuItem
                        key={k}
                        onSelect={(e) => {
                          if (k === 'W') {
                            toast.error("양자는 2025년 새롭게 신설된 분야로, 과년도 기술수준조사 결과가 없습니다.");
                          } else {
                            downloadFromPublic(pastPdf?.[k]);
                          }
                        }}
                      >
                        <FileChartColumn />
                        {major?.[k] || k}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="text-lg font-bold bg-muted content-center">
            특허분석 결과 자료를 다운받아 응답 시 참고해주시기 바랍니다.
          </div>
          <div className="bg-muted p-4">
            <div className="bg-card p-4 text-xl font-bold">
              특허분석 결과 다운로드
            </div>
            <div className="p-2 border">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button color="red" type="button">
                    PDF 파일
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {majorKeys.length === 0 ? (
                    <DropdownMenuItem disabled>
                      다운로드 가능한 자료가 없습니다
                    </DropdownMenuItem>
                  ) : (
                    majorKeys.map((k) => (
                      <DropdownMenuItem
                        key={k}
                        onSelect={(e) => {
                          downloadFromPublic(analyzePdf?.[k]);
                        }}
                        disabled={!analyzePdf?.[k]}
                      >
                        <FileChartColumn />
                        {major?.[k] || k}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>
        <h3 className="my-4 text-xl font-semibold">
          □ (기술성) 1차 조사에서 응답하신 값과 전체 응답자의 평균값을 각각 참고하시어 위원님께서 1차에 선택하신 중분류 기술의 기술성(기술수준, 기술격차 등)을 평가해주시기 바랍니다.
        </h3>
        <h4 className="text-xl font-semibold">
          2Q-1. (최고기술 보유국)&nbsp;
          <span className="font-normal">
            한국, 미국, 중국, 일본, 유럽 중 2025년 현재 분야 내 기술의 최상위 국가와 최고기술 보유기관을 제시해주시기 바랍니다.
          </span>
        </h4>
        <p className="ml-4">
          ※ 현재 제시된 최고기술국은 해당 중분류에서 1차 응답 시 최고기술국으로 가장 많이 제시된 국가<br />
          ※ 유럽의 경우, 유럽 내 최상위 기술 국가명(1개)을 제시해주시기 바랍니다.<br />
          ※ 국가별 특허 순위<span className="text-destructive">(!)</span>에 마우스를 올리면 5가지 지표별 국가 순위를 확인하실 수 있습니다.
        </p>
        <section className="my-2 border border-border rounded-lg overflow-hidden text-center">
          <article className="grid grid-cols-[5fr_1fr_1fr_1fr_1fr_1fr_4fr_3fr_4fr] border-b border-border text-lg">
            <div className="row-span-2 border-r border-border bg-muted font-bold leading-20">
              중분류
            </div>
            <div className="col-span-7 border-r border-b border-border bg-muted font-bold leading-10">
              최고기술 보유국
            </div>
            <div className="row-span-2 flex justify-center items-center bg-muted font-bold">
              최고기술
              <br />
              보유기관
            </div>
            {countries.map(country => (
              <div key={country.code} className="border-r border-border bg-muted font-bold leading-10">
                {country.name}
              </div>
            ))}
            <div className="border-r border-border bg-muted font-bold leading-10">
              유럽국가명*
            </div>
            <div className="border-r border-border bg-muted font-bold leading-10">
              기타
            </div>
            {userData?.map((item) => (
              <Fragment key={item.id}>
                <CountryItem
                  item={data.find((ele) => ele.code === item.code)}
                  intermediate={item.intermediate}
                  onChange={(key, value) => handleChange(item.code, key, value)}
                />
                <CountryItem
                  item={item}
                  intermediate='1차 응답값'
                />
                <CountryItem
                  item={{ id: item.id, code: item.code, country: modeData?.[item.code] }}
                  intermediate='1차 델파이 최고기술 보유국 최빈값'
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
            ))}
          </article>
        </section>
        <p>
          * 유럽 국가 선택 시 작성하며, 단일 국가만 제시 <br />
          ※ 기타 선택 시 해당 국가명 기재
        </p>
      </main>
      <SurveyFooter value={0} prevHref="/basic" error={error} />
    </Form>
  );
}

const CountryItem = ({ item, intermediate, onChange }) => {
  const modeKey =
    !onChange && intermediate?.includes("최빈값")
      ? `${item.code}-country-${item.country ?? ""}`
      : undefined;
  const modeKeyProps = modeKey ? { key: modeKey } : {};

  return (
    <article key={item.id} className="contents">
      <div className="border-b bg-primary p-2 text-sm font-bold text-primary-foreground whitespace-pre-line content-center">
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
                {onChange &&
                <span type="button" className="text-destructive">
                  (!)
                </span>}
              </div>
            </TooltipTrigger>
            {onChange &&
            <TooltipContent>
              <p>{item.description}</p>
            </TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
      <RadioGroup
        {...modeKeyProps}
        key={`${item.code}_country`}
        name={`${item.code}_country`}
        aria-label="country"
        className="contents"
        onChange={({ target }) => {
          target.type === "radio" && onChange("country", target.value)
        }}
        defaultValue={item.country}
        disabled={!onChange}
      >
        {countries.map(country => (
          <Label
            key={country.code}
            htmlFor={`${country.code}${item.code}`}
            className="flex justify-center items-center m-0 border-r border-b p-2 survey-input-cell"
          >
            <RadioGroupItem id={`${country.code}${item.code}`} value={country.code} />
          </Label>
        ))}
        <div className="flex items-center m-0 border-r border-b p-2 survey-input-cell">
          <Input
            aria-label="euName"
            name={`${item.code}_euName`}
            defaultValue={item.euName || ""}
            disabled={!onChange || item.country !== "eu"}
            required={item.country === "eu"}
            className={onChange ? "disabled:text-transparent" : ""}
          />
        </div>
        <Label
          htmlFor={`etc${item.code}`}
          className="flex items-center gap-1 border-r border-b px-2 survey-input-cell"
        >
          <RadioGroupItem id={`etc${item.code}`} value="etc" />
          <Input
            aria-label="etcName"
            name={`${item.code}_etcName`}
            defaultValue={item.etcName || ""}
            disabled={!onChange || item.country !== "etc"}
            required={item.country === "etc"}
            className={onChange ? "disabled:text-transparent" : ""}
          />
        </Label>
      </RadioGroup>
      <div className="flex items-center border-b px-2 survey-input-cell">
        <Input
          aria-label="institution"
          name={`${item.code}_institution`}
          defaultValue={item.institution || ""}
          disabled={!onChange}
        />
      </div>
    </article>
  )
}