import CategorySection from "./components/Categories";
import FarmerSpotlight from "./components/FarmerSpotlight";
import FreshProducts from "./components/FeaturedProducts";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";


export default function HomePage() {
  return (
    <>
      <Hero />
      <CategorySection />
      <FreshProducts />
      <FarmerSpotlight />
      <HowItWorks />
    </>
  );
}