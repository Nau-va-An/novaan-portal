import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import SignIn from './auth/SignIn';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return <SignIn />;
}
