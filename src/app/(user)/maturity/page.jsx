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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useForm } from "@/contexts/FormContext";
import { supabase } from "@/libs/supabaseClient";
import { cn } from "@/libs/utils";
import { buildModesByCode } from "@/libs/formStats";
import { Loader2 } from "lucide-react";

export default function Maturity() {
  const router = useRouter();

  const {
    userData,
    inputData,
    setInputData,
    clearForm,
  } = useForm();

  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [modeData, setModeData] = useState();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchModeData = async () => {
      if (!Array.isArray(userData) || userData.length === 0) return;

      const codes = [...new Set(userData.map((u) => u?.code).filter(Boolean))];
      if (codes.length === 0) return;

      const { data: rows, error } = await supabase
        .from("form")
        .select("code,maturity")
        .in("code", codes);

      if (error) {
        console.error(error);
        return;
      }

      const modeByCode = buildModesByCode(rows, ["maturity"]);
      const flat = Object.fromEntries(
        Object.entries(modeByCode || {}).map(([code, v]) => [code, v?.maturity])
      );
      setModeData(flat);
    };
    fetchModeData();
  }, [userData]);

  const handleSubmit = (formData) => {
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
      return !inputItem?.maturity;
    });

    if (hasError) {
      setError("모든 중분류에 대해 시장 성숙도를 선택해주세요.");
      return;
    }

    setInputData(newInputData);
    setOpenDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitLoading(true);
    const { error: errorForm } = await supabase.from("form2").insert(
      inputData.map((inter) => {
        const userItem = userData.find((u) => u.code === inter.code);
        const { description, ...rest } = inter;
        return {
          name: userItem?.name,
          company: userItem?.company,
          position: userItem?.position,
          classification: userItem?.classification,
          etc: userItem?.etc,
          career: userItem?.career,
          tel: userItem?.tel,
          email: userItem?.email,
          intermediate: userItem?.intermediate,
          field: userItem?.field,
          large: userItem?.large,
          ...rest,
        };
      })
    );

    if (errorForm) {
      console.error(errorForm);
      toast.error("설문 제출에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } else {
      clearForm();
      router.push("/finish");
    }

    setSubmitLoading(false);
  };

  return (
    <>
      <Form action={handleSubmit}>
        <header className="flex items-center gap-4 mb-3 rounded-lg bg-muted/60 p-3 shadow-sm ring-1 ring-border/50 backdrop-blur">
          <Badge className="align-middle">2</Badge>
          <h2 className="text-2xl font-semibold">
            기술수준조사
          </h2>
        </header>
        <main>
          <h4 className="text-xl font-semibold">
            2Q-11. (시장 성숙도)&nbsp;
            <span className="font-normal">
              제시된 중분류별 가장 적합한 시장 성숙도를 1차 응답 결과를 참고하시어 선택해주시기 바랍니다.
            </span>
          </h4>
          <p className="ml-4">
            ※ 시장 성숙도 : 해당 기술이 적용될 산업·시장 자체의 성숙한 정도 <br />
            ※ ‘1차 응답값’은 귀하께서 1차 조사 당시 응답하신 값이며, ‘1차 최빈값’은 귀하를 포함한 전체 응답자께서 가장 많이 응답 하신 값으로 두 값을 참고하여 2차 응답 선택
          </p>
          <section className="my-4 border-t border-r border-l text-center">
            <article className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted text-lg font-bold">
              <div className="flex justify-center items-center border-r border-b">
                중분류
              </div>
              <div className="border-r border-b bg-muted font-bold leading-20">
                구분
              </div>
              <div className="flex justify-center items-center border-r border-b p-2">
                ① 초기 시장
                <br />
                (실험적 수요만 발생)
              </div>
              <div className="flex justify-center items-center border-r border-b p-2">
                ② 성장기
                <br />
                (수요가 급격히 증가)
              </div>
              <div className="flex justify-center items-center border-r border-b p-2">
                ③ 성숙기
                <br />
                (수요가 안정적으로 유지)
              </div>
              <div className="flex justify-center items-center border-b p-2">
                ④ 쇠퇴기
                <br />
                (수요 정체·감소)
              </div>
              {userData?.map((item) => (
                <Fragment key={item.id}>
                  <MaturityItem
                    item={inputData.find((i) => i.code === item.code) || { code: item.code }}
                    intermediate={item.intermediate}
                    type="2차 응답"
                  />
                  <MaturityItem
                    item={item}
                    type="1차 응답값"
                  />
                  <MaturityItem
                    item={{ id: item.id, code: item.code, maturity: modeData?.[item.code] }}
                    type="1차 최빈값"
                  />
                </Fragment>
              ))}
            </article>
          </section>
        </main>
        <SurveyFooter
          value={90}
          prevHref="/availability"
          nextLabel="설문 제출"
          error={error}
        />
      </Form>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>최종 제출 확인</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  확인 버튼을 누르시는 경우, 현재 작성한 설문 내용이 최종 제출되며, 설문 작성 페이지로 돌아갈 수 없습니다.
                </p>
                <p>
                  제출을 원하시는 경우 '확인' 버튼을 눌러주세요.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              disabled={submitLoading}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                setOpenDialog(false);
                handleConfirmSubmit();
              }}
              disabled={submitLoading}
            >
              {submitLoading ? <Loader2 className="animate-spin" /> : "확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const MaturityItem = ({ item, intermediate, type }) => {
  const modeKey =
    type === "1차 최빈값" ? `${item.code}-maturity-${item.maturity ?? ""}` : undefined;
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
        name={`${item.code}_maturity`}
        aria-label="maturity"
        className="contents"
        defaultValue={item.maturity}
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
          className="flex justify-center items-center m-0 border-b p-2 survey-input-cell"
        >
          <RadioGroupItem id={`4${item.code}${type}`} value="4" />
        </Label>
      </RadioGroup>
    </article>
  );
};
