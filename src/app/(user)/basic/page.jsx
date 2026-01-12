"use client";

import { useState } from "react";
import Form from "@/components/client-form";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@/contexts/FormContext";
import { supabase } from "@/libs/supabaseClient";
import { toast } from "sonner";

export default function Basic() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {
    name,
    setName,
    tel1,
    setTel1,
    tel2,
    setTel2,
    tel3,
    setTel3,
    setUserData,
    setInputData,
  } = useForm();

  const [error, setError] = useState("");

  const handlePrev = () => {
    router.push("/");
  };

  const handleNext = async (formData) => {
    setIsLoading(true);

    setError("");
    setName(formData.get("name"));
    setTel1(formData.get("tel1"));
    setTel2(formData.get("tel2"));
    setTel3(formData.get("tel3"));

    const { data, error } = await supabase
      .from("form")
      .select("*")
      .eq("name", formData.get("name"))
      .eq("tel", formData.get("tel1") + formData.get("tel2") + formData.get("tel3"));

    if (error) {
      setError("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } else if (data.length === 0) {
      toast.error([
        "개인정보가 정확히 입력되었는지 확인해주시기 바라며,",
        "정확히 입력했음에도 동일한 오류가 나타날 경우 아래 이메일로 문의주시기 바랍니다.",
        "이메일 : kjhjs2080@woollimi.com"
      ].join("\n"));
    } else {
      const dedupedData = Array.from(data.reduce((acc, item) => {
        const key = item?.code;
        const curTime = Date.parse(item?.created_at ?? "");
        const prev = acc.get(key);
        if (!prev) {
          acc.set(key, item);
          return acc;
        }
        const prevTime = Date.parse(prev?.created_at ?? "");
        if ((Number.isNaN(prevTime) ? -Infinity : prevTime) <= (Number.isNaN(curTime) ? -Infinity : curTime)) {
          acc.set(key, item);
        }
        return acc;
      }, new Map()).values())

      const { data: industryData, error: industryError } = await supabase
        .from("industry")
        .select("code,description")
        .in("code", data.map((item) => item.code));
  
      if (industryError) {
        setError("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setUserData(dedupedData);
        setInputData(dedupedData.map((item) => ({
          code: item.code,
          description: industryData.find((industry) => industry.code === item.code)?.description
        })));
        router.push("/country");
      }
    }

    setIsLoading(false);
  };

  return (
    <Form action={handleNext}>
      <header className="flex items-center gap-4 mb-3 p-3 bg-muted/60 rounded-lg shadow-sm ring-1 ring-border/50 backdrop-blur">
        <Badge className="align-middle">1</Badge>
        <h2 className="text-2xl font-semibold">
          응답자 확인
        </h2>
      </header>
      <main>
        <h3 className="text-xl font-semibold">
          1Q. 귀하의 성명과 핸드폰 번호를 기재해주시기 바랍니다.
        </h3>
        <p className="ml-4">
          ※ 작성하신 성명과 핸드폰 번호를 기반으로 이후 문항이 구성되오니 정확히 기재해주시기 바랍니다.
        </p>
        <section className="flex flex-col sm:flex-row my-8 border border-border rounded-sm overflow-hidden">
          <div className="row-span-2 flex justify-center items-center bg-primary whitespace-nowrap p-2">
            <strong className="text-2xl text-primary-foreground text-center">응답자<br className="hidden sm:block" /> 정보</strong>
          </div>
          <div className="grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 grid-flow-col sm:grid-flow-row bg-border gap-px">
            <div className="bg-muted text-xl font-bold text-center content-center leading-10 p-2">
              성명
            </div>
            <div className="bg-muted text-xl font-bold text-center content-center leading-10 p-2">
              핸드폰 번호
            </div>
            <div className="flex items-center px-4 content-center p-2 survey-input-cell">
              <Input
                aria-label="name"
                name="name"
                defaultValue={name}
                required
              />
            </div>
            <div className="flex items-center px-4 content-center p-2 survey-input-cell">
              <Input
                type="tel1"
                aria-label="tel1"
                name="tel1"
                maxLength="4"
                defaultValue={tel1}
                required
              />
              <span className="m-1">-</span>
              <Input
                type="tel2"
                aria-label="tel2"
                name="tel2"
                maxLength="4"
                defaultValue={tel2}
                required
              />
              <span className="m-1">-</span>
              <Input
                type="tel3"
                aria-label="tel3"
                name="tel3"
                maxLength="4"
                defaultValue={tel3}
                required
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="my-4">
        <div className="text-right text-destructive mb-2">{error}</div>
        <div className="flex justify-end gap-4">
          <Button type="button" onClick={handlePrev} variant="outline" disabled={isLoading}>
            이전
          </Button>
          <Button type="submit" disabled={isLoading}>다음</Button>
        </div>
      </footer>
    </Form>
  );
}
