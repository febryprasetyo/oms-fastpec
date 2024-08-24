"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LimitPageCSR({
  limit,
  setLimit,
}: {
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <Select
      onValueChange={(e) => {
        setLimit(Number(e));
      }}
      defaultValue={limit.toString()}
    >
      <SelectTrigger className="w-[100px]" data-testid="limit-per-page">
        <SelectValue placeholder={"10"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={"5"} data-testid="limit-5">
            5
          </SelectItem>
          <SelectItem value={"10"} defaultChecked>
            10
          </SelectItem>
          <SelectItem value={"20"}>20</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
