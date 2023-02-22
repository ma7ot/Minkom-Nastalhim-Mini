import { Meta } from '../layout/Meta';
import { AppConfig } from '../utils/AppConfig';
import { Banner } from './Banner';
import { Footer } from './Footer';
import { RegisterHero } from './RegisterHero';
import { VerticalFeatures } from './VerticalFeatures';
import RegisterForm from './RegisterForm.js';
// Add a type annotation to specify the type of RegisterForm
const RegisterBase = () => (
  <div className="antialiased text-gray-600">
    <Meta title={AppConfig.title} description={AppConfig.description} />
    <RegisterHero />
   {/* <VerticalFeatures />
    <Banner />*/}
    <RegisterForm/>
    <Footer />
    
  </div>
);

export { RegisterBase };
