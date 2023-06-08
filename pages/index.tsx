import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import Test from './Home/Test';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return <Test />;
}
