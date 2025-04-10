import { Input } from './ui/Input';

function Header() {
  return (
    <div className="h-20 flex items-center px-10 justify-between border-b sticky top-0 bg-background/50 backdrop-blur-md z-50">
      <img
        draggable={false}
        src="/starkit.svg"
        className="w-10 aspect-square"
      />
      <div className="flex items-center gap-2">
        <Input placeholder="Search" className="w-60" />
      </div>
    </div>
  );
}

export default Header;
