"use client";

import React, { useState } from 'react';

// --- DANE (bez zmian) ---

const featuredArticleData = {
  imageUrl: 'https://www.magnapolonia.org/wp-content/uploads/2025/09/f5c8fb72e9ed71aa8fea939b06602c1c0000-1210x642.jpg',
  title: 'To nasza wojna?',
  description: 'Tusk: „Wojna na Ukrainie to także nasza wojna”. Premier otwarcie przyznaje, że Polska jest stroną konfliktu. Po co to nam?',
  author: 'Jan Kowalski',
  readTime: '5 min read',
  date: '04.09.2025',
  rating: 2.3,
  ratingDetails: {
    bezstronnosc: { score: 1.5, explanation: 'Artykuł wyraźnie faworyzuje jedną stronę konfliktu, cytując głównie anonimowe źródła.' },
    jezyk: { score: 2.8, explanation: 'Język jest nacechowany emocjonalnie, co może wpływać na obiektywizm przekazu.' },
    kontekst: { score: 2.4, explanation: 'Brak szerszego kontekstu historycznego i geopolitycznego przedstawionych wydarzeń.' },
    poprawnosc: { score: 3.2, explanation: 'Niektóre z przedstawionych danych nie znajdują potwierdzenia w niezależnych źródłach.' },
  },
};

const latestArticles = [
  {
    imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/71b8/live/3dee5a20-a03f-11f0-af31-9d0b79382753.jpg.webp',
    title: 'Szczyt UE w Brukseli: Kluczowe decyzje dla Polski',
    author: 'Anna Nowak', readTime: '6 min read', date: '03.10.2025', rating: 8.9,
    ratingDetails: {
      bezstronnosc: { score: 9.0, explanation: 'Przedstawiono stanowiska wielu stron, zachowując neutralność.' },
      jezyk: { score: 9.5, explanation: 'Język jest profesjonalny, precyzyjny i wolny od błędów.' },
      kontekst: { score: 8.5, explanation: 'Szeroko opisano tło polityczne i historyczne podejmowanych decyzji.' },
      poprawnosc: { score: 8.7, explanation: 'Wszystkie dane i cytaty zostały zweryfikowane w kilku źródłach.' },
    }
  },
  {
    imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/b00d/live/35d04c80-9dcf-11f0-9f23-2534d63ace40.jpg.webp',
    title: 'Nowa ustawa medialna: Spór w parlamencie narasta',
    author: 'Piotr Wiśniewski', readTime: '5 min read', date: '02.10.2025', rating: 3.4,
    ratingDetails: {
      bezstronnosc: { score: 2.5, explanation: 'Artykuł skupia się niemal wyłącznie na krytyce opozycji.' },
      jezyk: { score: 4.0, explanation: 'Użyto sformułowań potocznych i oceniających.' },
      kontekst: { score: 3.0, explanation: 'Brak odniesień do podobnych ustaw w innych krajach UE.' },
      poprawnosc: { score: 5.0, explanation: 'Dane są przedstawione wybiórczo, pomijając niewygodne fakty.' },
    }
  },
  {
    imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/1b97/live/c81acb80-a05c-11f0-92db-77261a15b9d2.jpg.webp',
    title: 'Budżet obronny na przyszły rok: Rekordowe wydatki na wojsko',
    author: 'Marta Zielińska', readTime: '7 min read', date: '01.10.2025', rating: 7.2,
    ratingDetails: {
      bezstronnosc: { score: 7.0, explanation: 'Przedstawiono dane rządowe, ale uwzględniono też opinie ekspertów.' },
      jezyk: { score: 8.0, explanation: 'Język jest formalny i techniczny, odpowiedni do tematyki.' },
      kontekst: { score: 7.5, explanation: 'Wydatki porównano z budżetami innych krajów NATO.' },
      poprawnosc: { score: 6.5, explanation: 'Dane liczbowe są poprawne, ale brakuje analizy ich realnego wpływu.' },
    }
  }
];

const moreArticles = [
  { imageUrl: 'https://ichef.bbci.co.uk/ace/standard/1024/cpsprodpb/af65/live/c5300160-a13d-11f0-928c-71dbb8619e94.jpg.webp', title: 'Relacje z USA: Wizyta prezydenta w Waszyngtonie', rating: 9.5, ratingDetails: { bezstronnosc: { score: 9.5, explanation: 'Relacja jest zbalansowana.' }, jezyk: { score: 9.8, explanation: 'Profesjonalny język dyplomatyczny.' }, kontekst: { score: 9.2, explanation: 'Szeroki kontekst historyczny.' }, poprawnosc: { score: 9.6, explanation: 'Fakty zweryfikowane.' } } },
  { imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/5e94/live/7548e480-a112-11f0-807b-c1a7ae4b635d.jpg.webp', title: 'Transformacja energetyczna: Wyzwania i szanse dla Polski', rating: 6.8, ratingDetails: { bezstronnosc: { score: 7.0, explanation: 'Zbalansowane opinie ekspertów.' }, jezyk: { score: 8.0, explanation: 'Język jest zrozumiały.' }, kontekst: { score: 6.0, explanation: 'Kontekst jest wystarczający.' }, poprawnosc: { score: 6.2, explanation: 'Dane są poprawne.' } } },
  { imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/6b09/live/9d0674b0-a135-11f0-a9f1-8d9167fcc08f.png.webp', title: 'Reforma sądownictwa: Gorąca debata w Sejmie', rating: 1.8, ratingDetails: { bezstronnosc: { score: 1.5, explanation: 'Artykuł jest stronniczy.' }, jezyk: { score: 2.0, explanation: 'Język nacechowany emocjonalnie.' }, kontekst: { score: 1.0, explanation: 'Brak kontekstu.' }, poprawnosc: { score: 3.0, explanation: 'Występują nieścisłości.' } } },
  { imageUrl: 'https://static.polityka.pl/_resource/res/path/16/44/1644fd37-d290-450e-a962-49bb2bf65aa0_f1400x900', title: 'Cyfryzacja administracji publicznej: Postępy i problemy', rating: 5.5, ratingDetails: { bezstronnosc: { score: 6.0, explanation: 'Przedstawiono różne perspektywy.' }, jezyk: { score: 7.0, explanation: 'Język jest poprawny.' }, kontekst: { score: 4.0, explanation: 'Ograniczony kontekst.' }, poprawnosc: { score: 5.0, explanation: 'Dane są w większości poprawne.' } } },
  { imageUrl: 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/71b8/live/3dee5a20-a03f-11f0-af31-9d0b79382753.jpg.webp', title: 'Wyniki sondażowe: Jakie jest poparcie dla partii politycznych?', rating: 4.1, ratingDetails: { bezstronnosc: { score: 3.0, explanation: 'Sondaż jednej firmy bez porównania.' }, jezyk: { score: 6.0, explanation: 'Język jest neutralny.' }, kontekst: { score: 4.0, explanation: 'Brak analizy trendów.' }, poprawnosc: { score: 4.5, explanation: 'Metodologia jest niejasna.' } } }
];

// --- KOMPONENTY ---

const getRatingColor = (rating) => {
  const hue = (rating / 10) * 120;
  return { backgroundColor: `hsl(${hue}, 90%, 35%)` };
};

const RatingBadge = ({ rating, onClick, className = '' }) => (
  <div
    className={`absolute top-2 right-2 text-white text-sm font-bold px-2 py-1 flex items-center justify-center rounded-md cursor-pointer ${className}`}
    style={getRatingColor(rating)}
    onClick={onClick}
  >
    {rating.toFixed(1)}
  </div>
);

const RatingModal = ({ isOpen, onClose, article }) => {
  if (!isOpen || !article) return null;

  const details = article.ratingDetails || {};
  const categories = [
    { key: 'bezstronnosc', name: 'Bezstronność' },
    { key: 'jezyk', name: 'Język' },
    { key: 'kontekst', name: 'Kontekst' },
    { key: 'poprawnosc', name: 'Poprawność informacji' }
  ];

  return (
    // ZMIANA TŁA: Dodano backdrop-blur-sm i zmieniono krycie na 60%
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white text-black rounded-lg p-6 max-w-lg w-full m-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-1">Szczegółowa ocena</h3>
        <p className="text-gray-600 mb-4 text-sm font-semibold">{article.title}</p>
        
        <div className="space-y-4">
          {categories.map(cat => (
            details[cat.key] && (
              <div key={cat.key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-800">{cat.name}</span>
                  <span className="text-white text-xs font-bold px-2 py-0.5 rounded-md" style={getRatingColor(details[cat.key].score)}>
                    {details[cat.key].score.toFixed(1)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm italic">„{details[cat.key].explanation}”</p>
              </div>
            )
          ))}
        </div>

        {/* ZMIANA KOLORU: Użyto dokładnego koloru #34495e */}
        <button 
          onClick={onClose} 
          className="mt-6 bg-[#34495e] text-white w-full py-2 rounded-lg hover:bg-[#2c3e50] transition"
        >
          Zamknij
        </button>
      </div>
    </div>
  );
};


const FeaturedArticle = ({ article, onRatingClick }) => (
  <section className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 my-8 px-6">
    <div className="relative">
      <img src={article.imageUrl} alt={article.title} className="rounded-lg w-full h-full object-cover" />
      <RatingBadge rating={article.rating} onClick={() => onRatingClick(article)} className="text-4xl font-bold w-24 h-16 rounded-xl" />
    </div>
    <div className="flex flex-col justify-center">
      <h2 className="text-4xl font-bold mb-4 text-black">{article.title}</h2>
      <p className="text-gray-700 text-lg mb-6">{article.description}</p>
      <p className="text-gray-500 mb-6">{article.author} - {article.readTime} - {article.date}</p>
      <ul className="space-y-3">
        <li><span className="font-semibold">Bezstronność:</span> {article.ratingDetails.bezstronnosc.score}</li>
        <li><span className="font-semibold">Język:</span> {article.ratingDetails.jezyk.score}</li>
        <li><span className="font-semibold">Kontekst:</span> {article.ratingDetails.kontekst.score}</li>
        <li><span className="font-semibold">Poprawność informacji:</span> {article.ratingDetails.poprawnosc.score}</li>
      </ul>
    </div>
  </section>
);

const ArticleCard = ({ article, onRatingClick }) => (
  <div className="flex-1 relative">
    <div className="h-64 bg-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
       <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
    </div>
    <RatingBadge rating={article.rating} onClick={() => onRatingClick(article)} />
    <h3 className="text-xl font-semibold mb-2 text-black">{article.title}</h3>
    <p className="text-gray-600 text-sm">By {article.author} - {article.readTime} - {article.date}</p>
  </div>
);

const SmallArticleCard = ({ article, onRatingClick }) => (
    <div className="flex-1 relative">
        <div className="h-40 bg-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        </div>
        <RatingBadge rating={article.rating} onClick={() => onRatingClick(article)} />
        <h4 className="font-semibold text-black">{article.title}</h4>
    </div>
);

export default function NewsPage() {
  const [isModalOpen, setIsModalOpen] =
useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleRatingClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  return (
    <div className="bg-transparent text-black font-sans">
      <main>
        <FeaturedArticle article={featuredArticleData} onRatingClick={handleRatingClick} />

        <section className="container mx-auto my-12 px-6">
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-blue-500 pl-4 text-black">Latest</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.map((article, index) => (
              <ArticleCard key={index} article={article} onRatingClick={handleRatingClick} />
            ))}
          </div>
        </section>

        <section className="container mx-auto my-12 px-6">
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-blue-500 pl-4 text-black">More</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {moreArticles.map((article, index) => (
              <SmallArticleCard key={index} article={article} onRatingClick={handleRatingClick} />
            ))}
          </div>
        </section>
      </main>

      <RatingModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        article={selectedArticle} 
      />
    </div>
  );
}