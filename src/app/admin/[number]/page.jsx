"use client";

import { useState, useEffect, useMemo, use } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { calAvg, calMed, calQ1, calQ3, calQ1Q3 } from "@/libs/table-helpers";

import { supabase } from "@/libs/supabaseClient";

const columnHelper = createColumnHelper();

function CustomToolbar({ onExportCSV, onPrint }) {
  return (
    <div className="mb-4 flex justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPrint}>인쇄</DropdownMenuItem>
          <DropdownMenuItem onClick={onExportCSV}>CSV 다운로드</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function Industry({ params }) {
  const { number } = use(params);

  const [rows, setRows] = useState([]);

  const processedRows = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      krPerAvg: calAvg(row.krPerAvg || []),
      krPerMed: calMed(row.krPerMed || []),
      krPerQ1: calQ1(row.krPerQ1 || []),
      krPerQ3: calQ3(row.krPerQ3 || []),
      krPer: calQ1Q3(row.krPerQ1 || [], row.krPerQ3 || []),
      krMonthAvg: calAvg(row.krMonthAvg || []),
      krMonthMed: calMed(row.krMonthMed || []),
      krMonthQ1: calQ1(row.krMonthQ1 || []),
      krMonthQ3: calQ3(row.krMonthQ3 || []),
      krMonth: calQ1Q3(row.krMonthQ1 || [], row.krMonthQ3 || []),
      importanceAvg: calAvg(row.importanceAvg || []),
      importanceMed: calMed(row.importanceMed || []),
      importanceQ1: calQ1(row.importanceQ1 || []),
      importanceQ3: calQ3(row.importanceQ3 || []),
      importance: calQ1Q3(row.importanceQ1 || [], row.importanceQ3 || []),
      urgencyAvg: calAvg(row.urgencyAvg || []),
      urgencyMed: calMed(row.urgencyMed || []),
      urgencyQ1: calQ1(row.urgencyQ1 || []),
      urgencyQ3: calQ3(row.urgencyQ3 || []),
      urgency: calQ1Q3(row.urgencyQ1 || [], row.urgencyQ3 || []),
      effectAvg: calAvg(row.effectAvg || []),
      effectMed: calMed(row.effectMed || []),
      effectQ1: calQ1(row.effectQ1 || []),
      effectQ3: calQ3(row.effectQ3 || []),
      effect: calQ1Q3(row.effectQ1 || [], row.effectQ3 || []),
      krSkillAvg: calAvg(row.krSkillAvg || []),
      krSkillMed: calMed(row.krSkillMed || []),
      krSkillQ1: calQ1(row.krSkillQ1 || []),
      krSkillQ3: calQ3(row.krSkillQ3 || []),
      krSkill: calQ1Q3(row.krSkillQ1 || [], row.krSkillQ3 || []),
      independenceAvg: calAvg(row.independenceAvg || []),
      independenceMed: calMed(row.independenceMed || []),
      independenceQ1: calQ1(row.independenceQ1 || []),
      independenceQ3: calQ3(row.independenceQ3 || []),
      independence: calQ1Q3(row.independenceQ1 || [], row.independenceQ3 || []),
      krAvailabilityAvg: calAvg(row.krAvailabilityAvg || []),
      krAvailabilityMed: calMed(row.krAvailabilityMed || []),
      krAvailabilityQ1: calQ1(row.krAvailabilityQ1 || []),
      krAvailabilityQ3: calQ3(row.krAvailabilityQ3 || []),
      krAvailability: calQ1Q3(row.krAvailabilityQ1 || [], row.krAvailabilityQ3 || []),
      maturityAvg: calAvg(row.maturityAvg || []),
      maturityMed: calMed(row.maturityMed || []),
      maturityQ1: calQ1(row.maturityQ1 || []),
      maturityQ3: calQ3(row.maturityQ3 || []),
      maturity: calQ1Q3(row.maturityQ1 || [], row.maturityQ3 || []),
    }));
  }, [rows]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("large", {
        header: "대분류",
        size: 350,
      }),
      columnHelper.accessor("intermediate", {
        header: "중분류",
        size: 350,
      }),
      columnHelper.accessor("krPerAvg", {
        header: "평균",
        size: 70,
      }),
      columnHelper.accessor("krPerMed", {
        header: "중위수",
        size: 70,
      }),
      columnHelper.accessor("krPerQ1", {
        header: "Q1",
        size: 70,
      }),
      columnHelper.accessor("krPerQ3", {
        header: "Q3",
        size: 70,
      }),
      columnHelper.accessor("krPer", {
        header: "Q1~3",
        size: 150,
      }),
      columnHelper.accessor("krMonthAvg", {
        header: "평균",
        size: 70,
      }),
      columnHelper.accessor("krMonthMed", {
        header: "중위수",
        size: 70,
      }),
      columnHelper.accessor("krMonthQ1", {
        header: "Q1",
        size: 70,
      }),
      columnHelper.accessor("krMonthQ3", {
        header: "Q3",
        size: 70,
      }),
      columnHelper.accessor("krMonth", {
        header: "Q1~3",
        size: 150,
      }),
      columnHelper.accessor("importanceAvg", {
        header: "평균",
        size: 70,
      }),
      columnHelper.accessor("importanceMed", {
        header: "중위수",
        size: 70,
      }),
      columnHelper.accessor("importanceQ1", {
        header: "Q1",
        size: 70,
      }),
      columnHelper.accessor("importanceQ3", {
        header: "Q3",
        size: 70,
      }),
      columnHelper.accessor("importance", {
        header: "Q1~3",
        size: 150,
      }),
      columnHelper.accessor("urgencyAvg", {
        header: "평균",
        size: 70,
      }),
      columnHelper.accessor("urgencyMed", {
        header: "중위수",
        size: 70,
      }),
      columnHelper.accessor("urgencyQ1", {
        header: "Q1",
        size: 70,
      }),
      columnHelper.accessor("urgencyQ3", {
        header: "Q3",
        size: 70,
      }),
      columnHelper.accessor("urgency", {
        header: "Q1~3",
        size: 150,
      }),
      columnHelper.accessor("effectAvg", {
        header: "평균",
        size: 70,
      }),
      columnHelper.accessor("effectMed", {
        header: "중위수",
        size: 70,
      }),
      columnHelper.accessor("effectQ1", {
        header: "Q1",
        size: 70,
      }),
      columnHelper.accessor("effectQ3", {
        header: "Q3",
        size: 70,
      }),
      columnHelper.accessor("effect", {
        header: "Q1~3",
        size: 150,
      }),
      columnHelper.accessor("krSkillAvg", {
        header: "평균",
        size: 70,
      }),
      columnHelper.accessor("krSkillMed", {
        header: "중위수",
        size: 70,
      }),
      columnHelper.accessor("krSkillQ1", {
        header: "Q1",
        size: 70,
      }),
      columnHelper.accessor("krSkillQ3", {
        header: "Q3",
        size: 70,
      }),
      columnHelper.accessor("krSkill", {
        header: "Q1~3",
        size: 150,
      }),
      columnHelper.accessor("independenceAvg", {
        header: "평균",
        size: 70,
      }),
      columnHelper.accessor("independenceMed", {
        header: "중위수",
        size: 70,
      }),
      columnHelper.accessor("independenceQ1", {
        header: "Q1",
        size: 70,
      }),
      columnHelper.accessor("independenceQ3", {
        header: "Q3",
        size: 70,
      }),
      columnHelper.accessor("independence", {
        header: "Q1~3",
        size: 150,
      }),
      columnHelper.accessor("krAvailabilityAvg", {
        header: "평균",
        size: 70,
      }),
      columnHelper.accessor("krAvailabilityMed", {
        header: "중위수",
        size: 70,
      }),
      columnHelper.accessor("krAvailabilityQ1", {
        header: "Q1",
        size: 70,
      }),
      columnHelper.accessor("krAvailabilityQ3", {
        header: "Q3",
        size: 70,
      }),
      columnHelper.accessor("krAvailability", {
        header: "Q1~3",
        size: 150,
      }),
      columnHelper.accessor("maturityAvg", {
        header: "평균",
        size: 70,
      }),
      columnHelper.accessor("maturityMed", {
        header: "중위수",
        size: 70,
      }),
      columnHelper.accessor("maturityQ1", {
        header: "Q1",
        size: 70,
      }),
      columnHelper.accessor("maturityQ3", {
        header: "Q3",
        size: 70,
      }),
      columnHelper.accessor("maturity", {
        header: "Q1~3",
        size: 150,
      }),
    ],
    []
  );

  useEffect(() => {
    const fetchForm = async () => {
      const { data, error } = await supabase
        .from("form2")
        .select("*")
        .like("code", `${number.toUpperCase()}%`)
        .order("code");

      setRows(
        Object.values(
          data.reduce((acc, cur) => {
            const key = cur.code;

            if (acc[key]) {
              acc[key].krPerAvg.push(cur.krPer);
              acc[key].krPerMed.push(cur.krPer);
              acc[key].krPerQ1.push(cur.krPer);
              acc[key].krPerQ3.push(cur.krPer);
              acc[key].krMonthAvg.push(cur.krMonth);
              acc[key].krMonthMed.push(cur.krMonth);
              acc[key].krMonthQ1.push(cur.krMonth);
              acc[key].krMonthQ3.push(cur.krMonth);
              acc[key].importanceAvg.push(cur.importance);
              acc[key].importanceMed.push(cur.importance);
              acc[key].importanceQ1.push(cur.importance);
              acc[key].importanceQ3.push(cur.importance);
              acc[key].urgencyAvg.push(Number(cur.urgency));
              acc[key].urgencyMed.push(Number(cur.urgency));
              acc[key].urgencyQ1.push(Number(cur.urgency));
              acc[key].urgencyQ3.push(Number(cur.urgency));
              acc[key].effectAvg.push(Number(cur.effect));
              acc[key].effectMed.push(Number(cur.effect));
              acc[key].effectQ1.push(Number(cur.effect));
              acc[key].effectQ3.push(Number(cur.effect));
              acc[key].krSkillAvg.push(Number(cur.krSkill));
              acc[key].krSkillMed.push(Number(cur.krSkill));
              acc[key].krSkillQ1.push(Number(cur.krSkill));
              acc[key].krSkillQ3.push(Number(cur.krSkill));
              acc[key].independenceAvg.push(Number(cur.independence));
              acc[key].independenceMed.push(Number(cur.independence));
              acc[key].independenceQ1.push(Number(cur.independence));
              acc[key].independenceQ3.push(Number(cur.independence));
              acc[key].krAvailabilityAvg.push(Number(cur.krAvailability));
              acc[key].krAvailabilityMed.push(Number(cur.krAvailability));
              acc[key].krAvailabilityQ1.push(Number(cur.krAvailability));
              acc[key].krAvailabilityQ3.push(Number(cur.krAvailability));
              acc[key].maturityAvg.push(Number(cur.maturity));
              acc[key].maturityMed.push(Number(cur.maturity));
              acc[key].maturityQ1.push(Number(cur.maturity));
              acc[key].maturityQ3.push(Number(cur.maturity));
            }

            if (!acc[key]) {
              acc[key] = {
                id: cur.id,
                field: cur.field,
                large: cur.large,
                intermediate: cur.intermediate,
                krPerAvg: [cur.krPer],
                krPerMed: [cur.krPer],
                krPerQ1: [cur.krPer],
                krPerQ3: [cur.krPer],
                krMonthAvg: [cur.krMonth],
                krMonthMed: [cur.krMonth],
                krMonthQ1: [cur.krMonth],
                krMonthQ3: [cur.krMonth],
                importanceAvg: [cur.importance],
                importanceMed: [cur.importance],
                importanceQ1: [cur.importance],
                importanceQ3: [cur.importance],
                urgencyAvg: [Number(cur.urgency)],
                urgencyMed: [Number(cur.urgency)],
                urgencyQ1: [Number(cur.urgency)],
                urgencyQ3: [Number(cur.urgency)],
                effectAvg: [Number(cur.effect)],
                effectMed: [Number(cur.effect)],
                effectQ1: [Number(cur.effect)],
                effectQ3: [Number(cur.effect)],
                krSkillAvg: [Number(cur.krSkill)],
                krSkillMed: [Number(cur.krSkill)],
                krSkillQ1: [Number(cur.krSkill)],
                krSkillQ3: [Number(cur.krSkill)],
                independenceAvg: [Number(cur.independence)],
                independenceMed: [Number(cur.independence)],
                independenceQ1: [Number(cur.independence)],
                independenceQ3: [Number(cur.independence)],
                krAvailabilityAvg: [Number(cur.krAvailability)],
                krAvailabilityMed: [Number(cur.krAvailability)],
                krAvailabilityQ1: [Number(cur.krAvailability)],
                krAvailabilityQ3: [Number(cur.krAvailability)],
                maturityAvg: [Number(cur.maturity)],
                maturityMed: [Number(cur.maturity)],
                maturityQ1: [Number(cur.maturity)],
                maturityQ3: [Number(cur.maturity)],
              };
            }

            return acc;
          }, {})
        )
      );

      error && console.error(error);
    };

    fetchForm();
  }, [number]);

  const table = useReactTable({
    data: processedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleExportCSV = () => {
    const headers = [
      "대분류",
      "중분류",
      "2Q-2(기술수준) 평균",
      "2Q-2(기술수준) 중위수",
      "2Q-2(기술수준) Q1",
      "2Q-2(기술수준) Q3",
      "2Q-2(기술수준) Q1~3",
      "2Q-3(기술격차) 평균",
      "2Q-3(기술격차) 중위수",
      "2Q-3(기술격차) Q1",
      "2Q-3(기술격차) Q3",
      "2Q-3(기술격차) Q1~3",
      "2Q-4(중요도) 평균",
      "2Q-4(중요도) 중위수",
      "2Q-4(중요도) Q1",
      "2Q-4(중요도) Q3",
      "2Q-4(중요도) Q1~3",
      "2Q-5(시급성) 평균",
      "2Q-5(시급성) 중위수",
      "2Q-5(시급성) Q1",
      "2Q-5(시급성) Q3",
      "2Q-5(시급성) Q1~3",
      "2Q-6(파급효과) 평균",
      "2Q-6(파급효과) 중위수",
      "2Q-6(파급효과) Q1",
      "2Q-6(파급효과) Q3",
      "2Q-6(파급효과) Q1~3",
      "2Q-7(기술성숙도) 평균",
      "2Q-7(기술성숙도) 중위수",
      "2Q-7(기술성숙도) Q1",
      "2Q-7(기술성숙도) Q3",
      "2Q-7(기술성숙도) Q1~3",
      "2Q-8(기술자립도) 평균",
      "2Q-8(기술자립도) 중위수",
      "2Q-8(기술자립도) Q1",
      "2Q-8(기술자립도) Q3",
      "2Q-8(기술자립도) Q1~3",
      "2Q-10(시장활용성) 평균",
      "2Q-10(시장활용성) 중위수",
      "2Q-10(시장활용성) Q1",
      "2Q-10(시장활용성) Q3",
      "2Q-10(시장활용성) Q1~3",
      "2Q-11(시장성숙도) 평균",
      "2Q-11(시장성숙도) 중위수",
      "2Q-11(시장성숙도) Q1",
      "2Q-11(시장성숙도) Q3",
      "2Q-11(시장성숙도) Q1~3",
    ];
    const csvContent = [
      headers.join(","),
      ...processedRows.map((row) =>
        [
          row.large,
          row.intermediate,
          row.krPerAvg,
          row.krPerMed,
          row.krPerQ1,
          row.krPerQ3,
          row.krPer,
          row.krMonthAvg,
          row.krMonthMed,
          row.krMonthQ1,
          row.krMonthQ3,
          row.krMonth,
          row.importanceAvg,
          row.importanceMed,
          row.importanceQ1,
          row.importanceQ3,
          row.importance,
          row.urgencyAvg,
          row.urgencyMed,
          row.urgencyQ1,
          row.urgencyQ3,
          row.urgency,
          row.effectAvg,
          row.effectMed,
          row.effectQ1,
          row.effectQ3,
          row.effect,
          row.krSkillAvg,
          row.krSkillMed,
          row.krSkillQ1,
          row.krSkillQ3,
          row.krSkill,
          row.independenceAvg,
          row.independenceMed,
          row.independenceQ1,
          row.independenceQ3,
          row.independence,
          row.krAvailabilityAvg,
          row.krAvailabilityMed,
          row.krAvailabilityQ1,
          row.krAvailabilityQ3,
          row.krAvailability,
          row.maturityAvg,
          row.maturityMed,
          row.maturityQ1,
          row.maturityQ3,
          row.maturity,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `응답현황_${number}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="w-[87vw] h-[89vh]">
      <h2 className="mb-2 text-2xl font-semibold">
        &lt; 현재 분야 : {rows[0]?.field} &gt;
      </h2>
      <CustomToolbar onExportCSV={handleExportCSV} onPrint={handlePrint} />
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted" rowSpan={2} style={{ width: 350 }}>
                대분류
              </TableHead>
              <TableHead className="bg-muted" rowSpan={2} style={{ width: 350 }}>
                중분류
              </TableHead>
              <TableHead className="bg-muted text-center" colSpan={5} style={{ width: 510 }}>
                2Q-2(기술수준)
              </TableHead>
              <TableHead className="bg-muted text-center" colSpan={5} style={{ width: 510 }}>
                2Q-3(기술격차)
              </TableHead>
              <TableHead className="bg-muted text-center" colSpan={5} style={{ width: 510 }}>
                2Q-4(중요도)
              </TableHead>
              <TableHead className="bg-muted text-center" colSpan={5} style={{ width: 510 }}>
                2Q-5(시급성)
              </TableHead>
              <TableHead className="bg-muted text-center" colSpan={5} style={{ width: 510 }}>
                2Q-6(파급효과)
              </TableHead>
              <TableHead className="bg-muted text-center" colSpan={5} style={{ width: 510 }}>
                2Q-7(기술성숙도)
              </TableHead>
              <TableHead className="bg-muted text-center" colSpan={5} style={{ width: 510 }}>
                2Q-8(기술자립도)
              </TableHead>
              <TableHead className="bg-muted text-center" colSpan={5} style={{ width: 510 }}>
                2Q-10(시장활용성)
              </TableHead>
              <TableHead className="bg-muted text-center" colSpan={5} style={{ width: 510 }}>
                2Q-11(시장성숙도)
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="bg-muted" style={{ width: 70 }}>평균</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>중위수</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q1</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q3</TableHead>
              <TableHead className="bg-muted" style={{ width: 150 }}>Q1~3</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>평균</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>중위수</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q1</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q3</TableHead>
              <TableHead className="bg-muted" style={{ width: 150 }}>Q1~3</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>평균</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>중위수</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q1</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q3</TableHead>
              <TableHead className="bg-muted" style={{ width: 150 }}>Q1~3</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>평균</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>중위수</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q1</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q3</TableHead>
              <TableHead className="bg-muted" style={{ width: 150 }}>Q1~3</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>평균</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>중위수</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q1</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q3</TableHead>
              <TableHead className="bg-muted" style={{ width: 150 }}>Q1~3</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>평균</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>중위수</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q1</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q3</TableHead>
              <TableHead className="bg-muted" style={{ width: 150 }}>Q1~3</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>평균</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>중위수</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q1</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q3</TableHead>
              <TableHead className="bg-muted" style={{ width: 150 }}>Q1~3</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>평균</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>중위수</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q1</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q3</TableHead>
              <TableHead className="bg-muted" style={{ width: 150 }}>Q1~3</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>평균</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>중위수</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q1</TableHead>
              <TableHead className="bg-muted" style={{ width: 70 }}>Q3</TableHead>
              <TableHead className="bg-muted" style={{ width: 150 }}>Q1~3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell || cell.column.columnDef.header, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
