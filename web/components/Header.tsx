import logo from './starkit.svg';
import { Input } from './ui/Input';
import { useState } from 'react';

interface HeaderProps {
  onSearchTermChange: (searchTerm: string) => void;
}

function Header({ onSearchTermChange }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    onSearchTermChange(newSearchTerm);
  };

  return (
    <div className="h-20 flex items-center px-10 justify-between border-b sticky top-0 bg-background/50 backdrop-blur-md z-50">
      <img draggable={false} src={logo} className="w-10 aspect-square" />
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search"
          className="w-60"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
    </div>
  );
}

export default Header;
