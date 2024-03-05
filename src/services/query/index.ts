import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      return r.json();
    })
    .then((data) => {
      return data;
    });

const cityFetcher = async (params: [url: string, id: string | undefined]) => {
  const [url, id] = params;
  const stringID = id ? id : "";
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stringID }),
  });
  const data = await r.json();
  return data;
};

export function useProvince() {
  return useSWR<Province>(
    `${process.env.NEXT_PUBLIC_URL}/api/station/province`,
    fetcher,
    {
      refreshInterval: 1000,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

export const useDevice = () => {
  return useSWR<Device>(
    `${process.env.NEXT_PUBLIC_URL}/api/station/device`,
    fetcher,
    {
      refreshInterval: 1000,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useCity = (id: string | undefined) => {
  return useSWR<City>(
    [`${process.env.NEXT_PUBLIC_URL}/api/station/city`, id],
    cityFetcher,
    {
      refreshInterval: 1000,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
