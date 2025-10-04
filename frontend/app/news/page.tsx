import React from 'react';

// You would typically use an icon library like 'react-icons' for these
const AiIcon = () => <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center text-3xl">AI</div>;
const LearningIcon = () => <div className="w-16 h-16 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xs text-center">PERONNLIZED<br/>LEARNING</div>;
const CircleIcon = () => <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-white rounded-full"></div></div>;


// --- MOCK DATA ---
// Data derived from the image for dynamic rendering
const latestArticles = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8fDE2NjEyNjczNTI&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
    title: 'The Rise of AI in Healthcare: Transforming Patient Care',
    author: 'Owen Carter',
    readTime: '4 min read',
    date: '04.09.2025'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8fDE2NjEyNjczNTI&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
    title: 'The Impact of Remote Work on Global Economies',
    author: 'Lily Turner',
    readTime: '6 min read',
    date: '04.09.2025'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8fDE2NjEyNjczNTI&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
    title: 'The Evolution of Space Exploration: New Frontiers',
    author: 'Lucas Harper',
    readTime: '7 min read',
    date: '04.09.2025'
  }
];

const moreArticles = [
  { imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=500', title: 'The Future of Food: Sustainable Agriculture Practices' },
  { imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500', title: 'The Role of Renewable Energy in Combating Climate Change' },
  { imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500', title: 'The Ethics of Genetic Engineering: A New Era of Medicine' },
  { icon: <LearningIcon />, title: 'The Future of Education: Personalized Learning Experiences' },
  { icon: <CircleIcon />, title: 'The Impact of Social Media on Society: A Double-Edged Sword' }
];

// --- COMPONENTS ---

const AnalysisMetric = ({ score, label, color }) => (
  <li className="flex items-center space-x-3">
    <span className={`h-4 w-4 rounded-full ${color}`}></span>
    <span className="text-lg font-semibold text-gray-800">{score}</span> {/* Changed to text-gray-800 for contrast */}
    <span className="text-gray-600">{label}</span> {/* Adjusted for contrast */}
  </li>
);

const FeaturedArticle = () => (
  <section className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 my-8 px-6">
    <div className="relative">
      <img src="https://www.magnapolonia.org/wp-content/uploads/2025/09/f5c8fb72e9ed71aa8fea939b06602c1c0000-1210x642.jpg" alt="Donald Tusk with soldiers" className="rounded-lg w-full h-full object-cover" />
      <div className="absolute top-4 right-4 bg-red-600/90 text-white text-4xl font-bold w-24 h-16 flex items-center justify-center rounded-xl"> {/* Changed to rounded-xl, adjusted w and h, removed border */}
        2.3
      </div>
    </div>
    <div className="flex flex-col justify-center">
      <h2 className="text-4xl font-bold mb-4 text-black">To nasza wojna?</h2> {/* Changed to text-black */}
      <p className="text-gray-700 text-lg mb-6"> {/* Adjusted for contrast */}
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
    <div className="h-64 bg-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden"> {/* Changed bg-gray-700 to bg-gray-300 */}
       <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-black">{article.title}</h3> {/* Changed to text-black */}
    <p className="text-gray-600 text-sm">By {article.author} - {article.readTime} - {article.date}</p> {/* Adjusted for contrast */}
  </div>
);

const SmallArticleCard = ({ article }) => (
    <div className="flex-1">
        <div className="h-40 bg-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden"> {/* Changed bg-gray-700 to bg-gray-300 */}
            {article.imageUrl ? (
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            ) : (
                article.icon
            )}
        </div>
        <h4 className="font-semibold text-black">{article.title}</h4> {/* Changed to text-black */}
    </div>
);

export default function NewsPage() {
  return (
    // Changed main text color to black
    <div className="bg-transparent text-black font-sans">
      <main>
        <FeaturedArticle />

        <section className="container mx-auto my-12 px-6">
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-blue-500 pl-4 text-black">Latest</h2> {/* Changed to text-black */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))}
          </div>
        </section>

        <section className="container mx-auto my-12 px-6">
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-blue-500 pl-4 text-black">More</h2> {/* Changed to text-black */}
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