"use client";

import React, { useState, useEffect, useMemo } from "react";
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

import { supabase } from "@/libs/supabaseClient";

const columnHelper = createColumnHelper();

export default function Main() {
  const [rows, setRows] = useState([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("field", {
        header: "분야",
        size: 200,
      }),
      columnHelper.accessor("large", {
        header: "대분류",
        size: 350,
      }),
      columnHelper.accessor("intermediate", {
        header: "중분류",
        size: 350,
      }),
      columnHelper.accessor("code", {
        header: "중분류 고유 번호",
        size: 150,
      }),
      columnHelper.accessor("totalCount", {
        header: "총 건수",
        size: 60,
      }),
      columnHelper.accessor("ind", {
        header: "산",
        size: 50,
      }),
      columnHelper.accessor("aca", {
        header: "학",
        size: 50,
      }),
      columnHelper.accessor("lab", {
        header: "연",
        size: 50,
      }),
      columnHelper.accessor("etc", {
        header: "기타",
        size: 50,
      }),
      columnHelper.accessor("required", {
        header: "추가 필요",
        size: 70,
        cell: (info) => {
          const row = info.row.original;
          if (
            row.totalCount < 40 ||
            row.ind < 10 ||
            row.aca < 10 ||
            row.lab < 10 ||
            row.etc < 10
          ) {
            return "O";
          }
          return "X";
        },
      }),
    ],
    []
  );

  useEffect(() => {
    const fetchForm = async () => {
      const { data, error } = await supabase
        .from("form2")
        .select("*")
        .order("code");

      setRows(
        Object.values(
          data.reduce((acc, cur) => {
            const key = cur.code;

            if (acc[key]) {
              acc[key].totalCount += 1;
            }

            if (!acc[key]) {
              acc[key] = {
                id: cur.id,
                field: cur.field,
                large: cur.large,
                intermediate: cur.intermediate,
                code: cur.code
                  .split("")
                  .map((char) => char.charCodeAt(0) - 64)
                  .join("-"),
                totalCount: 1,
                ind: 0,
                aca: 0,
                lab: 0,
                etc: 0,
              };
            }

            switch (cur.classification) {
              case "ind":
                acc[key].ind += 1;
                break;
              case "aca":
                acc[key].aca += 1;
                break;
              case "lab":
                acc[key].lab += 1;
                break;
              case "etc":
                acc[key].etc += 1;
            }

            return acc;
          }, {})
        )
      );

      error && console.error(error);
    };

    fetchForm();
  }, []);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleExportCSV = () => {
    const headers = [
      "분야",
      "대분류",
      "중분류",
      "중분류 고유 번호",
      "총 건수",
      "산",
      "학",
      "연",
      "기타",
      "추가 필요",
    ];
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.field,
          row.large,
          row.intermediate,
          row.code,
          row.totalCount,
          row.ind,
          row.aca,
          row.lab,
          row.etc,
          row.totalCount < 40 ||
          row.ind < 10 ||
          row.aca < 10 ||
          row.lab < 10 ||
          row.etc < 10
            ? "O"
            : "X",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "응답현황.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto w-[1382px]">
      <header>
        <h1 className="my-4 text-3xl font-semibold">
          258개 중분류별 응답 현황
        </h1>
      </header>
      <main>
        <div className="mb-4 flex justify-end gap-2">
          <Button onClick={handleExportCSV}>CSV 다운로드</Button>
          <Button onClick={handlePrint}>인쇄</Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-muted" style={{ width: 200 }}>
                  분야
                </TableHead>
                <TableHead className="bg-muted" style={{ width: 350 }}>
                  대분류
                </TableHead>
                <TableHead className="bg-muted" style={{ width: 350 }}>
                  중분류
                </TableHead>
                <TableHead className="bg-muted" style={{ width: 150 }}>
                  중분류 고유 번호
                </TableHead>
                <TableHead className="bg-muted" style={{ width: 60 }}>
                  총 건수
                </TableHead>
                <TableHead className="bg-muted text-center" colSpan={4} style={{ width: 200 }}>
                  소속별 건수
                </TableHead>
                <TableHead className="bg-muted" style={{ width: 70 }}>
                  추가 필요
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="bg-muted"></TableHead>
                <TableHead className="bg-muted"></TableHead>
                <TableHead className="bg-muted"></TableHead>
                <TableHead className="bg-muted"></TableHead>
                <TableHead className="bg-muted"></TableHead>
                <TableHead className="bg-muted" style={{ width: 50 }}>
                  산
                </TableHead>
                <TableHead className="bg-muted" style={{ width: 50 }}>
                  학
                </TableHead>
                <TableHead className="bg-muted" style={{ width: 50 }}>
                  연
                </TableHead>
                <TableHead className="bg-muted" style={{ width: 50 }}>
                  기타
                </TableHead>
                <TableHead className="bg-muted"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const value = cell.getValue();
                    const columnId = cell.column.id;
                    let cellClassName = "";

                    if (columnId === "totalCount" && value < 40) {
                      cellClassName = "bg-destructive/20 text-destructive";
                    } else if (
                      (columnId === "ind" ||
                        columnId === "aca" ||
                        columnId === "lab" ||
                        columnId === "etc") &&
                      value < 10
                    ) {
                      cellClassName = "bg-destructive/20 text-destructive";
                    }

                    return (
                      <TableCell key={cell.id} className={cellClassName}>
                        {flexRender(cell.column.columnDef.cell || cell.column.columnDef.header, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
