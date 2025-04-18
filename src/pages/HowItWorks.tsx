
import { Steps } from "@/components/how-it-works/Steps";
import { AdditionalInfo } from "@/components/how-it-works/AdditionalInfo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How FastFlip Works</h1>
            <p className="text-lg text-muted-foreground">
              Your complete guide to buying and selling on FastFlip
            </p>
          </div>
          <Steps />
          <AdditionalInfo />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
