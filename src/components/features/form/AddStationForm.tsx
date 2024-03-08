"use client";
type Props = {};
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  stationName: z.string({
    required_error: "Nama Stasiun harus diisi",
  }),
  address: z.string({
    required_error: "Alamat harus diisi",
  }),
  dinasName: z.string(),
  device: z.string(),
  province: z.string(),
  city: z.string(),
});

export default function AddStationForm({}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch("/api/station/create", {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.success) {
      toast({
        title: "Berhasil",
        description: "Data berhasil ditambahkan",
      });
    } else {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-end justify-center space-y-2"
      >
        <FormField
          control={form.control}
          name="stationName"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nama Stasiun</FormLabel>
              <FormControl>
                <Input placeholder="Nama Stasiun" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Input placeholder="Alamat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dinasName"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nama Dinas</FormLabel>
              <FormControl>
                <Input placeholder="Nama Dinas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="device"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Device</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Device" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="w-full" side="top">
                  {/* {device ? (
                    device?.data?.map((item) => {
                      const stringId = item.device_id.toString();

                      return (
                        <SelectItem key={item.device_id} value={stringId}>
                          {item.nama_dinas}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <div className="w-full py-5 text-center">
                      <p>
                        {isDeviceLoading
                          ? "Memuat Data"
                          : deviceError
                            ? "Terjadi Kesalahan"
                            : "Tidak Ada Data"}
                      </p>
                    </div>
                  )} */}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full flex-col justify-between gap-3 pb-3">
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Provinsi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Provinsi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full" side="top">
                    {/* {province ? (
                      province?.data?.map(
                        (item: { id: number; province_name: string }) => {
                          const stringId = item.id.toString();
                          return (
                            <SelectItem key={item.id} value={stringId}>
                              {item.province_name}
                            </SelectItem>
                          );
                        },
                      )
                    ) : (
                      <div className="w-full py-5 text-center">
                        <p>
                          {isProvinceLoading
                            ? "Memuat Data"
                            : provinceError
                              ? "Terjadi Kesalahan"
                              : "Tidak Ada Data"}
                        </p>
                      </div>
                    )} */}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Kabupaten</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!form.getValues("province")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kabupaten" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* {city ? (
                      city?.data?.map((item) => {
                        const stringId = item.id.toString();

                        return (
                          <SelectItem key={item.id} value={stringId}>
                            {item.city_name}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <div className="w-full py-5 text-center">
                        <p>
                          {isCityLoading
                            ? "Memuat Data"
                            : cityError
                              ? "Terjadi Kesalahan"
                              : "Memuat Data"}
                        </p>
                      </div>
                    )} */}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Tambah Data
        </Button>
      </form>
    </Form>
  );
}
