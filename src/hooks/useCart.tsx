import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
     const storagedCart = localStorage.getItem('@RocketShoes:cart')

     if (storagedCart) {
       return JSON.parse(storagedCart);
     }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productExists = updatedCart.find(prod => prod.id === productId);


      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1;

      const haveStock = await validateStock(amount,productId)

      if(!haveStock){
        throw new Error('Quantidade solicitada fora de estoque');  
      }

      if(!productExists){
        const product = await api.get(`/products/${productId}`);
        if(product.data.length === 0){
          throw new Error('Quantidade solicitada fora de estoque');  
        }
        const newProduct = {
          ...product.data,
          amount:1
        };
        updatedCart.push(newProduct);
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
        return
      }

      productExists.amount = amount;
      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

    } catch(err:any) {
      toast.error(err.message);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartProducts = [...cart];
      const productIndex = cartProducts.findIndex(product => product.id === productId)
      if(productIndex >= 0){
        cartProducts.splice(productIndex,1);
        setCart(cartProducts)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartProducts));
      }else{
        toast.error('Erro na remoção do Produto');
        return
      }

    } catch {
      
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
        if (amount <=0){
          return
        }
        const haveStock = await validateStock(amount,productId)
        if(!haveStock){
          toast.error('Erro na adição do produto');
          return  
        }

        const updatedCart = [...cart];
        const productExists = updatedCart.find(product => product.id === productId);
        if(productExists){
          productExists.amount = amount
          setCart(updatedCart);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
        }else{
          toast.error('Erro na alteração de quantidade do produto');
          return 
        }
    
    } catch(err:any) {
      
    }
  };

  async function validateStock(amount:number,productId:number){
    const stock = await api.get(`stock/${productId}`);
    const stockAmount = stock.data.amount;
    if(stockAmount < amount){
      return false
    }else{
      return true
    }
  }

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
