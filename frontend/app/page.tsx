import CardMock from "@/components/card-mock";
import TitleCardMock from "@/components/title-card-mock";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <TitleCardMock />
      {Array.apply(null, Array(Math.round((Math.random() * 10) % 5) + 1)).map(
        (_, i) => (
          <CardMock key={i} />
        )
      )}
    </section>
  );
}
