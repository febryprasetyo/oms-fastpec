"use client";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addStationList,
  editStationList,
  getCityList,
  getDeviceList,
  getProvinceList,
} from "@/services/api/station";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  nama_stasiun: z.string({
    required_error: "Nama Stasiun harus diisi",
  }),
  address: z.string({
    required_error: "Alamat harus diisi",
  }),
  nama_dinas: z.string({
    required_error: "Nama Dinas harus diisi",
  }),
  device_id: z.string({
    required_error: "Device harus diisi",
  }),
  province_id: z.union([z.string(), z.number()]),
  city_id: z.union([z.string(), z.number()]),
});
type props = {
  action: "add" | "edit";
  setIsOpen: Function;
  value?: StationTableData;
};

export default function StationForm({ action, setIsOpen, value }: props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_stasiun: value?.nama_stasiun,
      address: value?.address,
      province_id: value?.province_id,
      city_id: value?.city_id,
    },
  });

  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const provinceData = form.watch("province_id");
  const queryClient = useQueryClient();

  const {
    data: province,
    isLoading: provinceLoading,
    isError: provinceError,
  } = useQuery({
    queryKey: ["province"],
    queryFn: async () => {
      const res = await getProvinceList(accessToken as string);
      return res;
    },
  });

  const {
    data: device,
    isLoading: isDeviceLoading,
    isError: deviceError,
  } = useQuery({
    queryKey: ["deviceList"],
    queryFn: async () => {
      const res = await getDeviceList(accessToken as string);
      return res;
    },
  });

  const {
    data: city,
    isLoading: isCityLoading,
    isError: cityError,
  } = useQuery({
    queryKey: ["city", provinceData],
    queryFn: async () => {
      const res = await getCityList(accessToken as string, provinceData);
      return res;
    },
  });

  const StationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (action == "edit") {
        const res = await editStationList(
          { id: value?.id || "", ...data },
          accessToken as string,
        );
        return res;
      } else if (action == "add") {
        const res = await addStationList(data, accessToken as string);
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
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["station"],
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    StationMutation.mutate(values);
    setIsOpen(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-end justify-center space-y-2"
      >
        <FormField
          control={form.control}
          name="nama_stasiun"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nama Stasiun</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nama_dinas"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nama Dinas</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="device_id"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Device</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="dark:bg-dark">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="w-full py-2" side="top">
                  {device ? (
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
                  )}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full flex-col justify-between gap-3 pb-3">
          <FormField
            control={form.control}
            name="province_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Provinsi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={`${value?.province_id}`}
                >
                  <FormControl>
                    <SelectTrigger className="dark:bg-dark">
                      <SelectValue placeholder="Provinsi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full" side="top">
                    {province ? (
                      province.data.map(
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
                          {provinceLoading
                            ? "Memuat Data"
                            : provinceError
                              ? "Terjadi Kesalahan"
                              : "Tidak Ada Data"}
                        </p>
                      </div>
                    )}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Kabupaten</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={`${value?.city_id}`}
                  disabled={!form.getValues("province_id")}
                >
                  <FormControl>
                    <SelectTrigger className="dark:bg-dark">
                      <SelectValue placeholder="Kabupaten" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {city ? (
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
                    )}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          {action === "edit" ? "Edit Data" : "Tambah Data"}
        </Button>
      </form>
    </Form>
  );
}
