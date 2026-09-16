import ProductCard from './ProductCard';

const CategorySection = ({ category, onProductSelect }) => (
  <section id={`category-${category.id}`} className="public-category">
    <div className="public-category__heading">
      <h2>{category.name}</h2>
    </div>
    <div className="public-products">
      {category.products.map((product) => <ProductCard key={product.id} product={product} onSelect={onProductSelect} />)}
    </div>
  </section>
);

export default CategorySection;