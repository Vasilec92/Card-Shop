const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

class List {
   constructor(url, container, list = list2) {
      this.container = container;
      this.list = list;
      this.url = url;
      this.goods = [];
      this.allProducts = [];
      this.filtered = [];
      this._init();
   }
   getJson(url) {
      return fetch(`${API + this.url}`)
         .then(result => result.json())
         .catch(error => {
            console.log(error);
         })
   }
   handleData(data) {
      this.goods = [...data];
      this.render();
   }
   calcSum() {
      return this.allProducts.reduce((accum, item) => accum += item.price, 0);
   }

   render() {
      const block = document.querySelector(this.container);
      for (let product of this.goods) {
         const productObj = new this.list[this.constructor.name](product);
         console.log(productObj);
         this.allProducts.push(productObj);
         block.insertAdjacentHTML('beforeend', productObj.render());
      }
   }
   filter(value) {
      const regexp = new RegExp(value, 'i');
      this.filtered = this.allProducts.filter(product => regexp.test(product.product_name));
      this.allProducts.forEach(el => {
         const block = document.querySelector(`.product-item[data-id="${el.id_product}"]`);
         if (!this.filtered.includes(el)) {
            block.classList.add('invisible');
         } else {
            block.classList.remove('invisible');
         }
      })
   }
   _init() {
      return false
   }
}

class Item {
   constructor(el, img = 'https://placehold.it/200x150') {
      this.product_name = el.product_name;
      this.price = el.price;
      this.id_product = el.id_product;
      this.img = img;
   }
   render() {
      return `
         <div class = "col mt-2 mb-2" >
            <div class="card" data-id="${this.id_product}>  
               
                <div class = "card-body " >
                 <img src="https://img.icons8.com/windows/50/000000/shopping-cart.png" class = "card-img-top" alt = "image" />
                    <h5 class = "card-title text-center" > ${this.product_name} </h5>
                    <p class = "card-text text-center" > ${this.price}$</p>
                    <button  data-id="${this.id_product}"
                    data-name="${this.product_name}"
                    data-price="${this.price}" type = "button"
                    class = "btn btn-outline-secondary buy-btn" > Buy
                    </button>
                    
                </div>
            </div>
        </div>`;
   }
}

class ProductsList extends List {
   constructor(cart, container = '.products', url = "/catalogData.json") {
      super(url, container);
      this.cart = cart;
      this.getJson()
         .then(data => this.handleData(data));

   }

   _init() {
      document.querySelector(this.container).addEventListener('click', e => {
         if (e.target.classList.contains('buy-btn')) {
            this.cart.addProduct(e.target);
         }
      });
      /*   document.querySelector('.search-form').addEventListener('submit', e => {
           e.preventDefault();
           this.filter(document.querySelector('.search-field').value)
        }) */
   }
}


class ProductItem extends Item {}

class Cart extends List {
   constructor(container = ".basket", url = "/getBasket.json") {
      super(url, container);
      this.getJson()
         .then(data => {
            this.handleData(data.contents);
         });

   }



   addProduct(element) {

      let productId = +element.dataset['id'];
      let find = this.allProducts.find(product => product.id_product === productId);
      if (find) {
         find.quantity++;
         this._updateCart(find);

      } else {
         let product = {
            id_product: productId,
            price: +element.dataset['price'],
            product_name: element.dataset['name'],
            quantity: 1
         };
         this.goods = [product];
         this.render();
      }


   }
   removeProduct(element) {

      let productId = +element.dataset['id'];
      let find = this.allProducts.find(product => product.id_product === productId);
      if (find.quantity > 1) {
         find.quantity--;
         this._updateCart(find);
      } else {
         this.allProducts.splice(this.allProducts.indexOf(find), 1);
         document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
      }


   }
   _updateCart(product) {
      let block = document.querySelector(`.cart-item[data-id="${product.id_product}"]`);
      block.querySelector('.product-quantity').textContent = `${product.quantity}`;
      block.querySelector('.product-price').textContent = `${product.quantity*product.price}$`;
   }
   _init() {

      document.querySelector(this.container).addEventListener('click', e => {
         if (e.target.classList.contains('del-btn')) {
            this.removeProduct(e.target);
         }
      })

   }

}

class CartItem extends Item {
   constructor(el, img = 'https://placehold.it/50x100') {
      super(el, img);
      this.quantity = el.quantity;
   }
   render() {
      return `
       <tr class="cart-item" data-id="${this.id_product}">
         <th scope="row"></th>
         <td class="product-title">${this.product_name} </td>
         <td class="product-quantity">${this.quantity} </td>       
         <td class="product-single-price">${this.price}$</td>  
         <td class="product-price">$${this.quantity*this.price}</td>  
         <td><button class="del-btn" data-id="${this.id_product}">-</button></td>       
      </tr>    `
   }
}
const list2 = {
   ProductsList: ProductItem,
   Cart: CartItem
};

let cart = new Cart();
let products = new ProductsList(cart);