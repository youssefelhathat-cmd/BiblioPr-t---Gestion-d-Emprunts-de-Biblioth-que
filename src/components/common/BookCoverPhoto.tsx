import React, { useState } from 'react';
import { Book } from '../../types';
import { getBookCoverUrl, getLocalFallbackUrl } from '../../utils/bookCovers';
import { BookOpen } from 'lucide-react';

interface BookCoverPhotoProps {
  book: Partial<Book> & { title: string; category?: string; id?: string };
  className?: string;
  aspectClass?: string;
}

export const BookCoverPhoto: React.FC<BookCoverPhotoProps> = ({
  book,
  className = 'w-full h-full object-cover',
  aspectClass = 'h-40',
}) => {
  const primaryUrl = book.coverImage || getBookCoverUrl(book);
  const fallbackLocalUrl = getLocalFallbackUrl(book.category);

  const [currentSrc, setCurrentSrc] = useState<string>(primaryUrl);
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  const handleError = () => {
    if (currentSrc !== fallbackLocalUrl) {
      // Fallback to local image asset
      setCurrentSrc(fallbackLocalUrl);
    } else {
      // If even local fails, show the stylized book spine
      setHasFailed(true);
    }
  };

  if (hasFailed) {
    return (
      <div className={`w-full ${aspectClass} bg-gradient-to-br from-slate-800 to-blue-950 flex flex-col items-center justify-center text-white p-4 text-center select-none relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <BookOpen className="w-8 h-8 text-amber-400 mb-2 relative z-10" />
        <span className="text-xs font-serif font-bold text-white max-w-[90%] line-clamp-2 relative z-10">
          {book.title}
        </span>
        <span className="text-[10px] text-blue-200 mt-1 uppercase tracking-wider relative z-10">
          EST Fès BU
        </span>
      </div>
    );
  }

  return (
    <div className={`w-full ${aspectClass} relative overflow-hidden bg-slate-100 flex items-center justify-center`}>
      <img
        src={currentSrc}
        alt={`Couverture de ${book.title}`}
        loading="lazy"
        onError={handleError}
        referrerPolicy="no-referrer"
        className={`${className} transition-transform duration-300 group-hover:scale-105`}
      />
    </div>
  );
};
