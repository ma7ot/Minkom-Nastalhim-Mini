import { Meta } from '../layout/Meta';
import { AppConfig } from '../utils/AppConfig';
import { Banner } from './Banner';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { VerticalFeatures } from './VerticalFeatures';
import RegisterForm from './RegisterForm.js';
import LoginForm from './LoginForm.js';

// Add a type annotation to specify the type of RegisterForm
const Base = () => (
  <div className="antialiased text-gray-600">
    <Meta title={AppConfig.title} description={AppConfig.description} />
    <Hero />
    {/* <VerticalFeatures />
    <Banner />*/}
    <RegisterForm />
    <Footer />
  </div>
);

export { Base };
