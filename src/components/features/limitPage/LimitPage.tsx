import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

type Props = {
  setItemPerPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
};

export default function LimitPage({ itemsPerPage, setItemPerPage }: Props) {
  return (
    <Select
      defaultValue={`${itemsPerPage}`}
      onValueChange={(e) => {
        const value = parseInt(e);
        setItemPerPage(value);
      }}
    >
      <SelectTrigger className="w-[100px]" aria-label="Limit Per Page">
        <SelectValue placeholder={"10"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={"5"}>5</SelectItem>
          <SelectItem value={"10"} defaultChecked>
            10
          </SelectItem>
          <SelectItem value={"20"}>20</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
