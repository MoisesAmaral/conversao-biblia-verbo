interface Props {
  className?: string;
}

export default function Dot({ className = "" }: Props) {
  return <span className={`inline-block w-[7px] h-[7px] rounded-full shrink-0 ${className}`} />;
}
