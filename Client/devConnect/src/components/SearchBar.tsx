import { Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from './ui/input.tsx';

interface SearchBarProps {
  className?: string;
  button?: string;
}

const SearchBar = ({ className, button }: SearchBarProps) => {
  return (
    <form
      className={`relative w-full max-w-md border-2 border-input/30 rounded-md ${className || ''}`}
    >
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search posts..."
          className="w-full pl-9 pr-12 pt-2 pb-2"
        />
        <Button
          type="submit"
          variant="ghost"
          size="lg"
          className={`absolute right-0 top-0 h-full px-3 cursor-pointer hover:bg-input/20 ${button || ''}`}
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
