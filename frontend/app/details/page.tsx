"use client";

import React, { useState, useEffect } from 'react';

// --- DANE ---

const featuredArticleData = {
  imageUrl: 'https://www.magnapolonia.org/wp-content/uploads/2025/09/f5c8fb72e9ed71aa8fea939b06602c1c0000-1210x642.jpg',
  title: 'To nasza wojna?',
  fullText: `
    Decyzja o wsparciu militarnym dla Ukrainy, ogłoszona przez premiera Donalda Tuska, wywołała burzliwą debatę na krajowej scenie politycznej. Słowa premiera, że "wojna na Ukrainie to także nasza wojna", stały się punktem zapalnym dla dyskusji o roli Polski w trwającym konflikcie. Premier Tusk, podczas konferencji prasowej w Kancelarii Prezesa Rady Ministrów, podkreślił, że bierność w obliczu rosyjskiej agresji byłaby strategicznym błędem, który mógłby zagrozić bezpieczeństwu Polski w przyszłości. "Nie możemy udawać, że ten konflikt nas nie dotyczy. Każdy dzień zwłoki w działaniu to większe ryzyko dla całej Europy, a w szczególności dla państw graniczących z Rosją" – argumentował.
    <br/><br/>
    Zupełnie inne stanowisko prezentuje opozycja, która zarzuca rządowi niepotrzebne wciąganie Polski w konflikt zbrojny. Liderzy partii opozycyjnych twierdzą, że pomoc militarna powinna być ograniczona do wsparcia humanitarnego i dyplomatycznego. "Naszym priorytetem powinno być bezpieczeństwo polskich obywateli, a nie eskalowanie napięć z mocarstwem atomowym" – grzmiał jeden z posłów podczas debaty sejmowej. Eksperci ds. bezpieczeństwa międzynarodowego są podzieleni. Część z nich popiera zdecydowane działania rządu, wskazując na konieczność zatrzymania imperialnych ambicji Rosji. Inni ostrzegają przed ryzykiem bezpośredniej konfrontacji z NATO.
    <br/><br/>
    Analiza sytuacji wskazuje na złożoność problemu. Z jednej strony, Polska jako członek NATO i Unii Europejskiej ma zobowiązania sojusznicze i moralny obowiązek wspierania napadniętego sąsiada. Z drugiej strony, decyzje o zaangażowaniu militarnym muszą być podejmowane z najwyższą ostrożnością. Społeczeństwo również jest podzielone – sondaże opinii publicznej pokazują, że choć większość Polaków popiera pomoc dla Ukrainy, to obawia się bezpośredniego zaangażowania Polski w wojnę. Najbliższe tygodnie pokażą, czy rządowa strategia przyniesie oczekiwane rezultaty i jak wpłynie na pozycję Polski na arenie międzynarodowej.
  `,
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

// Zmieniono "score" na "rating" i zaktualizowano wartości
const mockComments = [
    { id: 1, author: 'Marek_Nowak', avatarUrl: 'https://i.pravatar.cc/150?u=marek', timestamp: '2 godziny temu', text: 'Wreszcie ktoś to powiedział głośno! Bierność to najgorsza opcja. Popieram premiera w 100%.', rating: 1.2, isBot: true },
    { id: 2, author: 'Anna_K', avatarUrl: 'https://i.pravatar.cc/150?u=anna', timestamp: '2 godziny temu', text: 'Nie zgadzam się. To jest igranie z ogniem. Rząd powinien skupić się na dyplomacji, a nie na wysyłaniu sprzętu.', rating: 7.8 },
    { id: 3, author: 'Historyk_82', avatarUrl: 'https://i.pravatar.cc/150?u=historyk', timestamp: '1 godzinę temu', text: 'Analiza w artykule jest bardzo powierzchowna. Brakuje odniesień do sytuacji z lat 90. Kontekst jest kluczowy, a tutaj go nie ma.', rating: 8.5 },
    { id: 4, author: 'Katarzyna_W', avatarUrl: 'https://i.pravatar.cc/150?u=katarzyna', timestamp: '45 minut temu', text: 'A co z naszą gospodarką? Nikt nie mówi o kosztach tego zaangażowania. To my za to wszystko zapłacimy z naszych podatków.', rating: 9.1 },
    { id: 5, author: 'Piotr_S', avatarUrl: 'https://i.pravatar.cc/150?u=piotr', timestamp: '30 minut temu', text: 'Dokładnie tak, @Anna_K. Eskalowanie konfliktu to nie jest rozwiązanie. Powinniśmy budować mosty, a nie mury.', rating: 3.5, isBot: true },
    { id: 6, author: 'Obserwator', avatarUrl: 'https://i.pravatar.cc/150?u=obserwator', timestamp: '15 minut temu', text: 'Ciekawy artykuł, ale ocena "Bezstronność" na 1.5 jest chyba trochę zbyt surowa. Mimo wszystko pokazano głos opozycji.', rating: 6.7 },
];

// --- KOMPONENTY POMOCNICZE ---

const getRatingColor = (rating) => {
  const hue = (rating / 10) * 120;
  return { backgroundColor: `hsl(${hue}, 90%, 35%)` };
};

const RatingBadge = ({ rating, className = '' }) => (
  <div
    className={`text-white font-bold flex items-center justify-center ${className}`}
    style={getRatingColor(rating)}
  >
    {rating.toFixed(1)}
  </div>
);

const validateComment = (text) => {
    const lowerText = text.toLowerCase();
    if (/\b(hańba|zdrada|wszyscy wiedzą|na pewno|oczywiste jest)\b/.test(lowerText)) {
        return { type: 'Manipulacja', message: 'Komentarz zawiera zwroty o charakterze manipulacyjnym.', color: 'text-red-600' };
    }
    if (/\b(kłamstwo|fake news|propaganda|nieprawda)\b/.test(lowerText)) {
        return { type: 'Fałszywa informacja', message: 'Komentarz zawiera sformułowania wskazujące na dezinformację.', color: 'text-red-600' };
    }
    if (/\b(idiota|głupi|debil)\b/.test(lowerText)) {
        return { type: 'Agresja', message: 'Komentarz zawiera wulgaryzmy lub ataki personalne.', color: 'text-yellow-600' };
    }
    if(text.length > 10) {
        return { type: 'OK', message: 'Komentarz wygląda w porządku.', color: 'text-green-600' };
    }
    return null;
}

// --- GŁÓWNY KOMPONENT STRONY ---

export default function ArticleDetailsPage() {
  const [newComment, setNewComment] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const article = featuredArticleData;

  useEffect(() => {
    const handler = setTimeout(() => {
        if (newComment) {
            setValidationResult(validateComment(newComment));
        } else {
            setValidationResult(null);
        }
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [newComment]);

  const categories = [
    { key: 'bezstronnosc', name: 'Bezstronność' },
    { key: 'jezyk', name: 'Język' },
    { key: 'kontekst', name: 'Kontekst' },
    { key: 'poprawnosc', name: 'Poprawność informacji' }
  ];

  return (
    <div className="bg-white text-black font-sans">
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {/* -- Nagłówek Artykułu -- */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h1>
            <RatingBadge rating={article.rating} className="text-4xl w-24 h-16 rounded-xl flex-shrink-0" />
          </div>
          <p className="text-gray-500 mt-4">
            Autor: {article.author} - {article.date}
          </p>
        </header>

        {/* -- Obrazek -- */}
        <img src={article.imageUrl} alt={article.title} className="w-full rounded-lg mb-8" />

        {/* -- Treść Artykułu -- */}
        <article 
            className="prose prose-lg max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: article.fullText }}
        />

        {/* -- Sekcja Ocen Szczegółowych -- */}
        <section className="mt-12 p-6 border rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Szczegółowa Analiza Oceny</h2>
            <div className="space-y-4">
                {categories.map(cat => (
                    <div key={cat.key}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-800">{cat.name}</span>
                        <RatingBadge rating={article.ratingDetails[cat.key].score} className="text-sm px-2 py-0.5 rounded-md" />
                    </div>
                    <p className="text-gray-600 text-sm italic">„{article.ratingDetails[cat.key].explanation}”</p>
                    </div>
                ))}
            </div>
        </section>

        {/* -- Sekcja Komentarzy -- */}
        <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">{mockComments.length} Komentarzy</h2>
            
            {/* Formularz dodawania komentarza */}
            <div className="mb-8">
                <textarea 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows="4"
                    placeholder="Napisz swój komentarz..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                {validationResult && (
                    <div className={`text-sm mt-2 font-semibold ${validationResult.color}`}>
                        {validationResult.type}: <span className="font-normal">{validationResult.message}</span>
                    </div>
                )}
                <button className="mt-2 px-6 py-2 bg-[#34495e] text-white font-semibold rounded-lg hover:bg-[#2c3e50] transition disabled:bg-gray-400">
                    Dodaj komentarz
                </button>
            </div>

            {/* Lista komentarzy */}
            <div className="space-y-6">
                {mockComments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-4">
                        <img src={comment.avatarUrl} alt={comment.author} className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold">{comment.author}</span>
                                    {comment.isBot && (
                                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">
                                            Konto o niskiej wiarygodności
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                </div>
                                {/* ZMIANA: Użycie RatingBadge zamiast punktacji +/- */}
                                <RatingBadge rating={comment.rating} className="text-xs px-2 py-0.5 rounded-md" />
                            </div>
                            <p className="text-gray-700 mt-1">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}