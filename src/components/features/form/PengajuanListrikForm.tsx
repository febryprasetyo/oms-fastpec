"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/services/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import {
  addPengajuanListrik,
  editPengajuanListrik,
} from "@/services/api/pengajuan";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStationList } from "@/services/api/station";

const formSchema = z.object({
  tanggal: z.date({ required_error: "Tanggal harus diisi" }),
  nama: z.string({ required_error: "Nama harus diisi" }),
  kwh: z.coerce.number({ required_error: "KWH harus diisi" }),
  harga: z.string({ required_error: "Harga harus diisi" }),
  station: z.string({ required_error: "Stasiun harus dipilih" }),
});

type Props = {
  action: "add" | "edit";
  setIsOpen: (open: boolean) => void;
  data?: PengajuanListrikData;
};

export default function PengajuanListrikForm({
  action,
  setIsOpen,
  data,
}: Props) {
  const accessToken = useAuthStore((state) => state?.user?.token?.access_token);
  const user = useAuthStore((state) => state?.user);
  const queryClient = useQueryClient();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Fetch Station List
  const stationQuery = useQuery({
    queryKey: ["station"],
    queryFn: () => getStationList(accessToken as string),
    enabled: !!accessToken,
  });

  const mutation = useMutation({
    mutationFn: async (formData: z.infer<typeof formSchema>) => {
      const payload: PengajuanListrikRequest = {
        ...formData,
        tanggal: format(formData.tanggal, "yyyy-MM-dd"),
        pic: user?.user_data?.username || "",
      };

      if (action === "edit") {
        const res = await editPengajuanListrik(
          data?.id as string | number,
          payload,
          accessToken as string,
        );
        if (res?.success === false) throw new Error(res.message);
        return res;
      } else {
        const res = await addPengajuanListrik(payload, accessToken as string);
        if (res?.success === false) throw new Error(res.message);
        return res;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description:
          action === "edit" ? "Data berhasil diubah" : "Data berhasil ditambah",
      });
      queryClient.invalidateQueries({ queryKey: ["pengajuan-listrik"] });
      setIsOpen(false);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      kwh: 0,
      harga: "",
      station: "",
    },
  });

  useEffect(() => {
    if (action === "edit" && data) {
      form.reset({
        tanggal: new Date(data.tanggal),
        nama: data.nama,
        kwh: data.kwh,
        harga: data.harga,
        station: data.station,
      });
    }
  }, [action, data, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tanggal"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal</FormLabel>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                        "text-black dark:text-white"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    fixedWeeks
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="station"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stasiun</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih stasiun" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="text-black dark:text-white">
                  {stationQuery.data?.data?.values?.map((station) => (
                    <SelectItem key={station.id} value={station.nama_stasiun}>
                      {station.nama_stasiun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pengajuan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Listrik 100rb" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kwh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KWH</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Contoh: 72" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="harga"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 100000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-5">
          <Button
            type="button"
            className="w-44"
            variant="destructive"
            onClick={() => setIsOpen(false)}
          >
            Batal
          </Button>
          <Button type="submit" className="w-44" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
