import Image from 'next/image';
import productImage from '@/assets/product.png';

export const ProductShowcase = () => {
  return (
    <section className="bg-gradient-to-b from-[#FFFFFF] to-[#D2DCFF] py-24">
      <div className="container">
        <div className="flex justify-center">
          <div className="tag">Boost your productivity</div>
        </div>
        <h2>A more effective way to track progress</h2>
        <p>
          Effortlessly turn your ideas into a fully functional, responsive, SaaS website in just minutes with this template.
        </p>
        <Image src={productImage} alt="Product Image" className="" />
      </div>
    </section>


  );
};
