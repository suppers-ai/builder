import { PageProps } from "fresh";
import ProductEditPage from "../../../islands/ProductEditPage.tsx";

export default function EditProductPage(props: PageProps) {
  const productId = props.params.id;
  
  return <ProductEditPage productId={productId} />;
}