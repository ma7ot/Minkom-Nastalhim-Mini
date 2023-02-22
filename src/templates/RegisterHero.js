import Link from 'next/link';
import Router, { useRouter } from "next/router";

import { Background } from '../background/Background';
import { Button } from '../button/Button';
import { HeroOneButton } from '../hero/HeroOneButton';
import { Section } from '../layout/Section';
import { NavbarTwoColumns } from '../navigation/NavbarTwoColumns';
import { Logo } from './Logo';

const RegisterHero = () => (
  <Background color="bg-gray-100">
   <Section yPadding="py-6">
      <NavbarTwoColumns logo={<Logo xl />}>
       
      </NavbarTwoColumns>
    </Section>
  </Background>
);

export { RegisterHero };
