type Props = {};

export default function loading({}: Props) {
  return (
    <main className="flex h-screen w-full items-center justify-center ">
      <div
        className="text-surface inline-block size-10 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </main>
  );
}
