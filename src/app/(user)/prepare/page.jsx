"use client";

import { useState, useEffect, use, Fragment } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useForm } from "@/contexts/FormContext";

import { supabase } from "@/libs/supabaseClient";

export default function Prepare({ params }) {
  const router = useRouter();

  const { number } = use(params);

  const { checkedInter, setCheckedInter, settingInter, setSettingInter } =
    useForm();

  const [industry, setIndustry] = useState([]);
  const [industryLength, setIndustrylength] = useState(0);
  const [settingConfirm, setSettingConfirm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleCheckInter = (
    e,
    id,
    field,
    large,
    intermediate,
    description,
    code,
    intermediates
  ) => {
    if (e) {
      setCheckedInter((prevList) => [
        ...prevList,
        {
          id,
          field,
          large,
          intermediate,
          description,
          code,
          intermediates,
        },
      ]);

      return;
    }

    if (!e) {
      setCheckedInter((prevList) =>
        prevList.filter((inter) => inter.code !== code)
      );
    }
  };

  const handlePrev = () => {
    router.push(`/${number}/basic`);
  };

  const handleNext = () => {
    if (checkedInter.length === 0) {
      toast.error("※ 한 개 이상의 중분류를 선택해 주세요!.");

      return;
    }

    if (settingConfirm) {
      setSettingInter(true);

      router.push(`/${number}/country`);

      return;
    }

    setOpenDialog(true);
  };

  useEffect(() => {
    const fetchIndustry = async () => {
      const { data, error } = await supabase
        .from("industry")
        .select("*")
        .like("code", `${number.toUpperCase()}%`)
        .order("id");

      setIndustry(
        data.reduce((acc, cur) => {
          const intermediates = [];

          data.forEach((ele) => {
            if (cur.large === ele.large) {
              intermediates.push({
                id: ele.id,
                intermediate: ele.intermediate,
                description: ele.description,
                code: ele.code,
              });
            }
          });

          !acc.find((ele) => ele.large === cur.large) &&
            acc.push({
              field: cur.field,
              large: cur.large,
              intermediates,
            });

          return acc;
        }, [])
      );

      setIndustrylength(data.length);

      error && console.error(error);
    };

    fetchIndustry();
  }, []);

  return (
    <div>
      <header className="my-3 p-3 bg-muted/60 rounded-lg shadow-sm ring-1 ring-border/50 backdrop-blur">
        <h2 className="text-2xl font-semibold">
          <Badge className="align-middle">2</Badge> 준비단계
        </h2>
      </header>
      <main>
        <h3 className="text-xl font-semibold">
          2Q. 주요 산업 분야 중분류 기술분야 중 귀하께서 응답이 가능한 중분류
          기술을 모두 선택해주시기 바랍니다.
        </h3>
        <p className="indent-4">
          ※ 기술분류 : {industry[0]?.field}
        </p>
        <section className="grid grid-cols-[2fr_2fr_3fr_3fr] my-4 border border-border rounded-lg overflow-hidden">
          <div className="border-r border-b border-border bg-muted text-xl font-bold text-center leading-10">
            기술분야
          </div>
          <div className="border-r border-b border-border bg-muted text-xl font-bold text-center leading-10">
            대분류
          </div>
          <div className="border-r border-b border-border bg-muted text-xl font-bold text-center leading-10">
            중분류
          </div>
          <div className="border-b border-border bg-muted text-xl font-bold text-center leading-10">
            정의
          </div>
          <div
            style={{ gridRow: `span ${industryLength}` }}
            className="flex justify-center items-center border-b border-border bg-primary text-2xl font-bold text-primary-foreground text-center whitespace-pre-line"
          >
            {industry[0]?.field.split(" ").reduce((acc, word, index) => {
              acc += (index + 1) % 2 === 0 ? `${word}\n` : `${word}\t`;

              return acc;
            }, "")}
          </div>
          {industry.map((lar, index) => (
            <Fragment key={index}>
              <div
                style={{ gridRow: `span ${lar.intermediates.length}` }}
                className="flex justify-center items-center border-b border-border bg-primary/90 text-xl font-bold text-primary-foreground text-center whitespace-pre-line"
              >
                {lar.large.split(" ").reduce((acc, word, index) => {
                  acc += (index + 1) % 3 === 0 ? `${word}\n` : `${word}\t`;

                  return acc;
                }, "")}
              </div>
              {lar.intermediates.map((intermediate, index, self) => (
                <Fragment key={index}>
                  <div className="flex items-center gap-2 border-r border-b border-border p-2">
                    <Checkbox
                      id={`intermediate-${intermediate.id}`}
                      checked={
                        !!checkedInter.find(
                          (inter) => inter.code === intermediate.code
                        )
                      }
                      onCheckedChange={(checked) =>
                        handleCheckInter(
                          !!checked,
                          intermediate.id,
                          lar.field,
                          lar.large,
                          intermediate.intermediate,
                          intermediate.description,
                          intermediate.code,
                          self
                        )
                      }
                      disabled={settingInter}
                    />
                    <Label htmlFor={`intermediate-${intermediate.id}`}>
                      {intermediate.intermediate}
                    </Label>
                  </div>
                  <p className="border-b p-1 text-sm">
                    {intermediate.description}
                  </p>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </section>
      </main>
      <footer className="flex justify-end gap-4 my-4">
        <Button type="button" onClick={handlePrev} variant="outline">
          이전
        </Button>
        <Button type="button" onClick={handleNext}>
          다음
        </Button>
      </footer>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>※주의사항※</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  - 선택하신 중분류를 다시 한번 검토해주세요. 선택하신 중분류를 기준으로 다음 설문이 이어집니다.
                </p>
                <p>
                  - 이 팝업창을 닫은 이후 '다음' 버튼을 누르는 경우 다음 설문문항으로 넘어가며, 더 이상 중분류 선택을 수정할 수 없습니다.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                setSettingConfirm(true);
                setOpenDialog(false);
              }}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
