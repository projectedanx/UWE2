
import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchFormProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, placeholder }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder || "Explore a word..."}
        className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-lg"
      />
      <button
        type="submit"
        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        disabled={!term.trim()}
      >
        <Search size={24} />
      </button>
    </form>
  );
};

export default SearchForm;
