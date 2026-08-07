// components/KlhkTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  data: any[];
};

export const KlhkTable = ({ data }: Props) => {
  // Helper to replace sentinel -3 values with 0 for UI display
  const formatValue = (val: any) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num === -3) return 0;
    return val;
  };

  return (
    <div className="bg-red-700p-5 overflow-x-auto rounded-xl shadow">
      <Table className="min-w-full border">
        <TableHeader className="bg-gray-100 ">
          <TableRow className="text-center">
            {[
              "IDStasiun",
              "Tanggal",
              "Jam",
              "Suhu",
              "TDS",
              "DO",
              "PH",
              "Turbidity",
              "Nitrat",
              "Amonia",
              "COD",
              "BOD",
              "TSS",
              "Kedalaman",
            ].map((key) => (
              <TableHead key={key} className="">
                {key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx} className="">
              {[
                "IDStasiun",
                "Tanggal",
                "Jam",
                "Suhu",
                "TDS",
                "DO",
                "PH",
                "Turbidity",
                "Nitrat",
                "Amonia",
                "COD",
                "BOD",
                "TSS",
                "Kedalaman",
              ].map((key) => (
                <TableCell key={key} className="">
                  {formatValue(row[key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
