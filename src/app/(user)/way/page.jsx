"use client";

import { useEffect, useState, Fragment } from "react";
import Form from "@/components/client-form";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SurveyFooter } from "@/components/survey/SurveyFooter";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useForm } from "@/contexts/FormContext";
import { supabase } from "@/libs/supabaseClient";
import { cn } from "@/libs/utils";
import { buildModesByCode } from "@/libs/formStats";

export default function Way() {
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
        .select("code,way")
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const modeByCode = buildModesByCode(rows, ["way"]);
      const flat = Object.fromEntries(
        Object.entries(modeByCode || {}).map(([code, v]) => [code, v?.way])
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
      return !inputItem?.way;
    });

    if (hasError) {
      setError("모든 대분류에 대해 기술격차 해소방안을 선택해주세요.");
      return;
    }

    setInputData(newInputData);
    router.push("/availability");
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
          2Q-9. (기술격차 해소방안)&nbsp;
          <span className="font-normal">
            선택하신 중분류의 기술격차를 해소하기 위해 가장 적합한 방안을 1차 응답 결과를 참고하시어 선택해주시기 바랍니다.
          </span>
        </h4>
        <p className="ml-4">
          ※ ‘1차 응답값’은 귀하께서 1차 조사 당시 응답하신 값이며, ‘1차 최빈값’은 귀하를 포함한 전체 응답자께서 가장 많이 응답하신 값으로 두 값을 참고하여 2차 응답 선택
        </p>
        <section className="my-4 border text-center">
          <article className="border-b bg-muted text-lg font-bold leading-8">
            드롭다운 목록
          </article>
          <article className="grid grid-cols-[1fr_1fr_1fr]">
            <div className="border-r border-b">① 정부 R&D 투자 확대</div>
            <div className="border-r border-b">② 민간 R&D 투자 확대</div>
            <div className="border-b">③ 시설장비 활용 가능성 제고</div>
            <div className="border-r border-b">④ 인력 수급 활성화</div>
            <div className="border-r border-b">⑤ 인력 전문성 제고</div>
            <div className="border-b">⑥ 국내 산학연 협력 강화</div>
            <div className="border-r">⑦ 국제공동연구 강화</div>
            <div>⑧ 기타</div>
          </article>
        </section>
        <section className="border-t border-r border-l text-center">
          <article className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-muted text-lg font-bold">
            <div className="border-r border-b">중분류</div>
            <div className="border-r border-b">구분</div>
            <div className="border-r border-b">기술격차 해소방안</div>
            <div className="border-b">기타 선택 시 작성란</div>
            {userData?.map((item) => (
              <Fragment key={item.id}>
                <WayItem
                  item={inputData.find((i) => i.code === item.code) || { code: item.code }}
                  intermediate={item.intermediate}
                  type="2차 응답"
                />
                <WayItem
                  item={item}
                  type="1차 응답값"
                />
                <WayItem
                  item={{ id: item.id, code: item.code, way: modeData?.[item.code], etcWay: "", reason: "" }}
                  type="1차 최빈값"
                />
              </Fragment>
            ))}
          </article>
        </section>
      </main>
      <SurveyFooter value={72} prevHref="/independence" error={error} />
    </Form>
  );
}

const WayItem = ({ item, intermediate, type }) => {
  const [etcWayEnabled, setEtcWayEnabled] = useState(false);
  const modeKey =
    type === "1차 최빈값" ? `${item.code}-way-${item.way ?? ""}` : undefined;
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
      <div className="flex items-center gap-2 border-r border-b p-2 survey-input-cell">
        <Select
          {...modeKeyProps}
          key={`${item.code}_way`}
          name={`${item.code}_way`}
          defaultValue={item.way}
          disabled={!intermediate}
          onValueChange={value => setEtcWayEnabled(value === "8")}
          required={!!intermediate}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="클릭하여 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">정부 R&amp;D 투자 확대</SelectItem>
            <SelectItem value="2">민간 R&amp;D 투자 확대</SelectItem>
            <SelectItem value="3">시설장비 활용 가능성 제고</SelectItem>
            <SelectItem value="4">인력 수급 활성화</SelectItem>
            <SelectItem value="5">인력 전문성 제고</SelectItem>
            <SelectItem value="6">국내 산학연 협력 강화</SelectItem>
            <SelectItem value="7">국제공동연구 강화</SelectItem>
            <SelectItem value="8">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 border-r border-b p-2 survey-input-cell">
        <Input
          aria-label="etcWay"
          name={`${item.code}_etcWay`}
          defaultValue={item.etcWay || ""}
          disabled={!intermediate || !etcWayEnabled}
          required={intermediate && etcWayEnabled}
        />
      </div>
    </article>
  );
};
