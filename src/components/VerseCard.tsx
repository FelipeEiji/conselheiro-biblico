// components/VerseCard.tsx
import React from 'react';
import { FiBookOpen } from 'react-icons/fi'; // Importando ícone de livro aberto

interface VerseCardProps {
  verseReference: string;
  verseText: string;
}

const VerseCard: React.FC<VerseCardProps> = ({ verseReference, verseText }) => (
  <div className="p-4 mb-4 border border-gray-300 rounded-lg bg-blue-100 dark:bg-blue-700 dark:border-blue-600">
    <div className="flex items-center text-sm font-bold text-blue-700 dark:text-blue-300">
      <FiBookOpen className="mr-2" /> {/* Ícone de livro aberto */}
      {verseReference}
    </div>
    <div className="mt-2 text-blue-900 dark:text-blue-100">{verseText}</div>
  </div>
);

export default VerseCard;
