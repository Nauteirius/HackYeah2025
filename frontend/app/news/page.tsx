import React from 'react';

// Ikony pozostają bez zmian
const AiIcon = () => <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center text-3xl">AI</div>;
const LearningIcon = () => <div className="w-16 h-16 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xs text-center">PERONNLIZED<br/>LEARNING</div>;
const CircleIcon = () => <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-white rounded-full"></div></div>;


// --- MOCK DATA ---

// ZAKTUALIZOWANA SEKcja 'latestArticles' z Twoimi linkami
const latestArticles = [
  {
    imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/71b8/live/3dee5a20-a03f-11f0-af31-9d0b79382753.jpg.webp',
    title: 'Szczyt UE w Brukseli: Kluczowe decyzje dla Polski',
    author: 'Anna Nowak',
    readTime: '6 min read',
    date: '03.10.2025'
  },
  {
    imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/b00d/live/35d04c80-9dcf-11f0-9f23-2534d63ace40.jpg.webp',
    title: 'Nowa ustawa medialna: Spór w parlamencie narasta',
    author: 'Piotr Wiśniewski',
    readTime: '5 min read',
    date: '02.10.2025'
  },
  {
    imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/1b97/live/c81acb80-a05c-11f0-92db-77261a15b9d2.jpg.webp',
    title: 'Budżet obronny na przyszły rok: Rekordowe wydatki na wojsko',
    author: 'Marta Zielińska',
    readTime: '7 min read',
    date: '01.10.2025'
  }
];

// ZAKTUALIZOWANA SEKcja 'moreArticles' z Twoimi linkami
const moreArticles = [
  { imageUrl: 'https://ichef.bbci.co.uk/ace/standard/1024/cpsprodpb/af65/live/c5300160-a13d-11f0-928c-71dbb8619e94.jpg.webp', title: 'Relacje z USA: Wizyta prezydenta w Waszyngtonie' },
  { imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/5e94/live/7548e480-a112-11f0-807b-c1a7ae4b635d.jpg.webp', title: 'Transformacja energetyczna: Wyzwania i szanse dla Polski' },
  { imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/6b09/live/9d0674b0-a135-11f0-a9f1-8d9167fcc08f.png.webp', title: 'Reforma sądownictwa: Gorąca debata w Sejmie' },
  { imageUrl: 'https://static.polityka.pl/_resource/res/path/16/44/1644fd37-d290-450e-a962-49bb2bf65aa0_f1400x900', title: 'Cyfryzacja administracji publicznej: Postępy i problemy' },
  { imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/71b8/live/3dee5a20-a03f-11f0-af31-9d0b79382753.jpg.webp', title: 'Wyniki sondażowe: Jakie jest poparcie dla partii politycznych?' } // Użyto ponownie jednego z linków
];


// --- COMPONENTS ---

const AnalysisMetric = ({ score, label, color }) => (
  <li className="flex items-center space-x-3">
    <span className={`h-4 w-4 rounded-full ${color}`}></span>
    <span className="text-lg font-semibold text-gray-800">{score}</span>
    <span className="text-gray-600">{label}</span>
  </li>
);

const FeaturedArticle = () => (
  <section className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 my-8 px-6">
    <div className="relative">
      <img src="https://www.magnapolonia.org/wp-content/uploads/2025/09/f5c8fb72e9ed71aa8fea939b06602c1c0000-1210x642.jpg" alt="Donald Tusk with soldiers" className="rounded-lg w-full h-full object-cover" />
      <div className="absolute top-4 right-4 bg-red-600/90 text-white text-4xl font-bold w-24 h-16 flex items-center justify-center rounded-xl">
        2.3
      </div>
    </div>
    <div className="flex flex-col justify-center">
      <h2 className="text-4xl font-bold mb-4 text-black">To nasza wojna?</h2>
      <p className="text-gray-700 text-lg mb-6">
        Tusk: „Wojna na Ukrainie to także nasza wojna”. Premier otwarcie przyznaje, że Polska jest stroną konfliktu. Po co to nam?
      </p>
      <p className="text-gray-500 mb-6">
        Jan Kowalski - 5 min read - 04.09.2025
      </p>
      <ul className="space-y-3">
        <AnalysisMetric score="1.5" label="Bezstronność" color="bg-red-500" />
        <AnalysisMetric score="2.8" label="Język" color="bg-red-500" />
        <AnalysisMetric score="2.4" label="Kontekst" color="bg-yellow-500" />
        <AnalysisMetric score="3.2" label="Poprawność infomacji" color="bg-yellow-500" />
      </ul>
    </div>
  </section>
);

const ArticleCard = ({ article }) => (
  <div className="flex-1">
    <div className="h-64 bg-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
       <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-black">{article.title}</h3>
    <p className="text-gray-600 text-sm">By {article.author} - {article.readTime} - {article.date}</p>
  </div>
);

const SmallArticleCard = ({ article }) => (
    <div className="flex-1">
        <div className="h-40 bg-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
            {article.imageUrl ? (
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            ) : (
                article.icon
            )}
        </div>
        <h4 className="font-semibold text-black">{article.title}</h4>
    </div>
);

export default function NewsPage() {
  return (
    <div className="bg-transparent text-black font-sans">
      <main>
        <FeaturedArticle />

        <section className="container mx-auto my-12 px-6">
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-blue-500 pl-4 text-black">Latest</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))}
          </div>
        </section>

        <section className="container mx-auto my-12 px-6">
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-blue-500 pl-4 text-black">More</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {moreArticles.map((article, index) => (
              <SmallArticleCard key={index} article={article} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}