"use client";
import { z } from "zod";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { addDeviceList, editDeviceList } from "@/services/api/device";
import { addInventoryList, editInventoryList } from "@/services/api/inventory";
import { getDeviceTableList } from "@/services/api/device";
import { useAuthStore } from "@/services/store";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  products: z.string({ required_error: "Nama barang harus diisi" }),
  serial_number: z.string({
    required_error: "Serial number barang harus diisi",
  }),
  condition: z.string({ required_error: "Kondisi barang harus diisi" }),
  date_in: z.date({ required_error: "Tanggal masuk barang harus diisi" }),
  date_out: z.date().optional(),
});

type Props = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  action: "add" | "edit";
  value?: InventoryTableData;
};
export default function InventarisForm({ setIsOpen, value, action }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: value?.products || "",
      serial_number: value?.serial_number || "",
      condition: value?.condition || "",
      date_in: value?.date_in ? new Date(value.date_in) : undefined,
      date_out: value?.date_out ? new Date(value.date_out) : undefined,
    },
  });
  const [isDateInOpen, setIsDateInOpen] = useState(false);
  const [isDateOutOpen, setIsDateOutOpen] = useState(false);

  useEffect(() => {
    if (value) {
      form.reset({
        products: value.products || "",
        serial_number: value.serial_number || "",
        condition: value.condition || "",
        date_in: value.date_in ? new Date(value.date_in) : undefined,
        date_out: value.date_out ? new Date(value.date_out) : undefined,
      });
    }
  }, [value, form]);

  const accessToken = useAuthStore((state) => state?.user?.token?.access_token);
  const queryClient = useQueryClient();

  // const deviceQuery = useQuery({
  //   queryKey: ["device"],
  //   queryFn: () => getDeviceTableList(accessToken as string),
  //   enabled: !!accessToken,
  // });

  const DeviceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (action == "edit") {
        const formattedData = {
          ...data,
          date_in: format(data.date_in, "yyyy-MM-dd"),
          date_out: data.date_out ? format(data.date_out, "yyyy-MM-dd") : undefined,
        };
        // console.log("EDIT PAYLOAD:", formattedData);
        const res = await editInventoryList(
          value?.id || "",
          formattedData,
          accessToken as string,
        );
        // console.log("EDIT RESPONSE:", res);
        if (res?.success === false) {
          throw new Error(res.message || "Gagal mengedit data");
        }
        return res;
      } else if (action == "add") {
        const formattedData = {
          ...data,
          date_in: format(data.date_in, "yyyy-MM-dd"),
          date_out: data.date_out ? format(data.date_out, "yyyy-MM-dd") : undefined,
        };
        // console.log("ADD PAYLOAD:", formattedData);
        const res = await addInventoryList(formattedData, accessToken as string);
        // console.log("ADD RESPONSE:", res);
        if (res?.success === false) {
          throw new Error(res.message || "Gagal menambah data");
        }
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
        variant: "default",
      });
      form.reset();
      setIsOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
  });

  const onsubmit = (data: z.infer<typeof formSchema>) => {
    DeviceMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onsubmit)}
        className="flex flex-col items-end justify-center space-y-5"
      >
        <div className="w-full space-y-3">
          <FormField
            control={form.control}
            name="products"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nama Item</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sensor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-black dark:text-white">
                    <SelectItem value="Sensor PH">Sensor PH</SelectItem>
                    <SelectItem value="Sensor DO">Sensor DO</SelectItem>
                    <SelectItem value="Sensor COD">Sensor COD</SelectItem>
                    <SelectItem value="Sensor BOD">Sensor BOD</SelectItem>
                    <SelectItem value="Sensor TSS">Sensor TSS</SelectItem>
                    <SelectItem value="Sensor TDS">Sensor TDS</SelectItem>
                    <SelectItem value="Sensor NO2">Sensor NO2</SelectItem>
                    <SelectItem value="Sensor NO3">Sensor NO3</SelectItem>
                    <SelectItem value="Sensor ORP">Sensor ORP</SelectItem>
                    <SelectItem value="Sensor Turbidity">Sensor Turbidity</SelectItem>
                    <SelectItem value="Sensor Suhu">Sensor Suhu</SelectItem>
                    <SelectItem value="Sensor Amonia">Sensor Amonia</SelectItem>
                    <SelectItem value="Sensor Kedalaman">Sensor Kedalaman</SelectItem>
                    <SelectItem value="PLC">PLC </SelectItem>
                    <SelectItem value="Gateway">Gateway</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder="Serial Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Kondisi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kondisi barang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="text-black dark:text-white">
                      <SelectItem value="baru">Baru</SelectItem>
                      <SelectItem value="bekas">Bekas</SelectItem>
                      <SelectItem value="rusak">Rusak</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
            control={form.control}
            name="date_in"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Masuk</FormLabel>
                <Popover open={isDateInOpen} onOpenChange={setIsDateInOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal text-black dark:text-white",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(e) => {
                        field.onChange(e);
                        setIsDateInOpen(false);
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
          {action === "edit" && (
            <FormField
              control={form.control}
              name="date_out"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Keluar</FormLabel>
                  <Popover open={isDateOutOpen} onOpenChange={setIsDateOutOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal text-black dark:text-white",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(e) => {
                          field.onChange(e);
                          setIsDateOutOpen(false);
                        }}
                        disabled={(date) =>
                          date < new Date("1900-01-01")
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
          )}
        </div>
        <div className="flex gap-3 pt-5">
          <Button
            type="button"
            className="w-44"
            variant="destructive"
            onClick={() => setIsOpen(false)}
          >
            Batal
          </Button>

          <Button type="submit" className="w-44">
            {action == "add" ? "Tambah Data" : "Edit Data"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
