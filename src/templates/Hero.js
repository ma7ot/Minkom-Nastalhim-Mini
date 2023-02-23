import Link from 'next/link';
import Router, { useRouter } from "next/router";

import { Background } from '../background/Background';
import { Button } from '../button/Button';
import { HeroOneButton } from '../hero/HeroOneButton';
import { Section } from '../layout/Section';
import { NavbarTwoColumns } from '../navigation/NavbarTwoColumns';
import { Logo } from './Logo';

const Hero = () => (
  <Background color="bg-gray-100">
    <Section yPadding="py-6">
      <NavbarTwoColumns logo={<Logo xl />}>
        
      </NavbarTwoColumns>
    </Section>

    <Section yPadding="pt-20 pb-5">
      <HeroOneButton
        title={
          <>
          <span style={{fontFamily: '"Jomhuria", cursive', fontSize: '1.7em'}}>{'مِنْكَ نَسْتَلْهِم\n'}</span>
            
            <span className="text-primary-500">Student Registration</span>
          </>
        }
        description=""
       
      />
    </Section>
  </Background>
);

export { Hero };
