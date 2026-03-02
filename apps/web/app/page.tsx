import HomeClient from "@/components/HomeClient";

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const rawAddress = searchParams?.address;
  const rawChainId = searchParams?.chainId;
  const initialAddress =
    typeof rawAddress === "string" && rawAddress.length > 0 ? rawAddress : undefined;
  const initialChainId =
    typeof rawChainId === "string" && !Number.isNaN(Number(rawChainId))
      ? Number(rawChainId)
      : undefined;

  return (
    <HomeClient initialAddress={initialAddress} initialChainId={initialChainId} />
  );
}

