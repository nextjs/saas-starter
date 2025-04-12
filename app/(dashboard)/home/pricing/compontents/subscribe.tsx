import { Button } from "@/components/ui/button";

export default function Subscribe(props: {
  title: string;
  price: string;
  yearPrice: string;
  discount: string;
}) {
  const { title, price, yearPrice, discount } = props;

  return (
    <div className="space-y-4 text-center py-4 relative">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <dl className="">
        <dt className="text-md font-bold">
          <span className="text-4xl font-bold">{price}</span>/月
        </dt>
        <dd className="text-md text-muted-foreground">
          <span className="text-lg">{yearPrice}</span>/年
        </dd>
      </dl>
      <Button variant="primary">
        <span className="text-base">立即订阅</span>
      </Button>
      <div className="absolute -top-4 -right-4 font-semibold text-md rounded-bl-md px-4 py-1 text-foreground bg-gradient-to-r from-[#0bbdb6]/90 to-[#00d179]/90">
        {discount} 折扣
      </div>
    </div>
  );
}
