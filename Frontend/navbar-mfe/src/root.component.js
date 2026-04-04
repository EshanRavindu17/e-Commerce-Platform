import Navbar from './components/Navbar';

export default function Root() {
  return (
    <Navbar cartCount={3} activePath="/products" />
  );
}
