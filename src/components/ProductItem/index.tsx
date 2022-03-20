import { MdAddShoppingCart } from "react-icons/md"
import { Product } from "./styles";

interface ProductItemProps {
  imgUrl: string;
  description: string;
  price: any;
  handleAddProduct?: ()=> void
  cartItemsAmount?: number;
}

const ProductItem = ({imgUrl,description,price,handleAddProduct,cartItemsAmount}:ProductItemProps) =>{
  return(
    <Product>
    <img src={imgUrl} alt={description} />
    <strong>{description}</strong>
    <span>{price}</span>
    <button
      type="button"
      data-testid="add-product-button"
     onClick={handleAddProduct}
    >
      <div data-testid="cart-product-quantity">
        <MdAddShoppingCart size={16} color="#FFF" />
        {cartItemsAmount} 
      </div>

      <span>ADICIONAR AO CARRINHO</span>
    </button>
  </Product>
  )
}

export default ProductItem;