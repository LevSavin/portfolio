class Api {
    constructor() {
        this.url = "./goods.json";
    }

    fetch(error, success) {
        let xhr;

        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    success(JSON.parse(xhr.responseText));
                } else if (xhr.status > 400) {
                    error("Ошибка");
                }
            }
        }

        xhr.open('GET', this.url, true);
        xhr.send();
    }

    fetchPromise() {
        return new Promise((resolve, reject) => {
            this.fetch(reject, resolve)
        })
    }
}

class GoodsItem {
    constructor(title, price, src, id) {
        this.title = title;
        this.src = src;
        this.price = price;
        this.id = id;
    }

    getHtml() {
        return `<div class="div__item"><img src=${this.src} class="div__img"><div class="div__item_goods-content">${this.title} ${this.price} \u20bd<button class="div__button" id="btn_${this.id}">Добавить</button></div></div>`;
    }
}

class Buttons {
    constructor() {
        this.$buttonsAdd = document.querySelector(".catalog");
        this.$search = document.querySelector('#search');
    }

    setButton() {
        this.$buttonsAdd.addEventListener("click", event => {
            var button = event.target.closest("button");
            if (button) { //проверяем, вдруг button-родителя нет
                goodsList.addToCart(button)
            }
        });
    }

    setSearchHandler(callback) {
        this.$search.addEventListener('input', callback);
    }
}

class GoodsList {
    constructor() {
        this.api = new Api();
        this.$goodsList = document.querySelector(".catalog");
        this.goods = [];
        this.filteredGoods = [];

        const fetch = this.api.fetchPromise();

        fetch.then((data) => {
                this.onFetchSuccess(data)
            })
            .catch((err) => {
                this.onFetchError(err)
            });
    }

    onFetchSuccess(data) {
        this.goods = data.map(({
            title,
            price,
            src,
            id
        }) => new GoodsItem(title, price, src, id));
        this.filteredGoods = this.goods;
        this.render();
        this.addBtn();
    }

    onFetchError(err) {
        this.$goodsList.insertAdjacentHTML("beforeend", `<h3>${err}</h3>`);
    }

    render() {
        this.$goodsList.textContent = "";
        this.filteredGoods.forEach((item) => {
            this.$goodsList.insertAdjacentHTML('beforeend', item.getHtml());
        })
    }

    addBtn() {
        this.buttons = new Buttons();
        this.buttons.setButton();
        this.buttons.setSearchHandler((evt) => {
            this.search(evt.target.value);
        })

    }

    addToCart(button) {
        cartList.addToCart(button)
    }

    search(str) {
        if (str === '') {
            this.filteredGoods = this.goods;
        }
        const regexp = new RegExp(str, 'gi');
        this.filteredGoods = this.goods.filter((good) => regexp.test(good.title));
        this.render();
    }
}

class CartItem {
    constructor(title, price, src, id, quantity) {
        this.title = title;
        this.src = src;
        this.price = price;
        this.id = id;
        this.quantity = quantity;
    }

    getHtml() {
        return `<tbody id="itemCart_${this.id}"><tr><td>${this.title} </td><td id="quantity_${this.id}">${this.quantity}</td><td> шт.</td><td id="price_${this.id}">${this.price*this.quantity}</td><td>\u20bd</td><td><button data-action="increase" id="increase_${this.id}">+</button><td><button data-action="decrease" id="decrease_${this.id}">-</button></td></tr></tbody>`;
    }
}

class CartButtons {
    constructor(elem) {
        elem.onclick = this.onClick.bind(this); //  метод this.onClick привязывается к контексту текущего объекта this. Т.к. иначе this внутри него будет ссылаться на DOM-элемент (elem), а не на объект Buttons, и this[action] будет не тем, что нам нужно.
    }

    increase(button) {
        cartList.increase(button)
    }

    decrease(button) {
        cartList.decrease(button)
    }

    clearCart() {
        cartList.clearCart()
    }

    onClick(event) {
        let button = event.target.closest("button");
        if (button) { //проверяем, вдруг button-родителя нет
            let action = event.target.closest("button").dataset.action; // определяем значения атрибута data у кнопки
            if (action) {
                this[action](button);
            }
        }
    };
}

class CartList {
    constructor() {
        this.$cartList = document.querySelector(".selected-items");
        this.$cartSum = document.querySelector(".sum");
        this.cartArray = [];
        this.fetchGoods()
    }

    fetchGoods() {
        if (this.cartArray.length > 0) {
            this.cartArray = this.cartArray.map(({
                title,
                price,
                src,
                id,
                quantity
            }) => new CartItem(title, price, src, id, quantity));
            this.render();
            this.countSum();
            this.addBtn();
        }
    }

    render() {
        this.$cartList.textContent = "";
        this.cartArray.forEach((good) => {
            this.$cartList.insertAdjacentHTML('beforeend', good.getHtml());
        })
    }

    addBtn() {
        this.buttons = new CartButtons(DOMcartList);
    }

    countSum() {
        let initialValue = 0;
        let sum = this.cartArray.reduce(function (accumulator, currentValue) {
            return accumulator + (currentValue.price * currentValue.quantity);
        }, initialValue);
        document.querySelector(".sum").textContent = `${sum} \u20bd`;
        if (this.cartArray.length < 1) {
            this.$cartSum.textContent = "";
        }
    }

    setId(button) {
        catalogId = button.id.split("_")[1] //индекс товара из массива товаров в каталоге
        cartId = this.cartArray.findIndex(x => x.id == catalogId); // индекс товара из массива корзины
    }

    addToCart(button) {
        let itemNum = button.id.split("_")[1] //индекс товара из массива товаров в каталоге
        let selectedItem = goodsList.goods[itemNum];

        if ((this.cartArray.length < 1) || (hasAlready(this.cartArray) == undefined)) {
            let cartItem = Object.create(selectedItem)
            cartItem.quantity = 1;
            this.cartArray.push(cartItem);
            this.fetchGoods()
        } else {
            this.increase(button)
        }

        function hasAlready(cart) { // проверяем по id, есть ли уже в корзине выбранный товар
            return cart.find(x => x.id === selectedItem.id);
        }
    }

    increase(button) {
        this.setId(button);
        this.cartArray[cartId].quantity += 1;
        document.getElementById("quantity_" + catalogId).textContent = this.cartArray[cartId].quantity;
        document.getElementById("price_" + catalogId).textContent = this.cartArray[cartId].quantity * this.cartArray[cartId].price;
        this.countSum()
    }

    decrease(button) {
        this.setId(button);
        if (this.cartArray[cartId].quantity > 1) {
            this.cartArray[cartId].quantity -= 1;
            document.getElementById("quantity_" + catalogId).textContent = this.cartArray[cartId].quantity;
            document.getElementById("price_" + catalogId).textContent = this.cartArray[cartId].quantity * this.cartArray[cartId].price;
        } else {
            let remItem = document.getElementById("itemCart_" + catalogId)
            remItem.remove()
            this.cartArray.splice(cartId, 1)
        }
        this.countSum()
    }

    clearCart() {
        this.cartArray = [];
        this.countSum()
        this.$cartList.textContent = "";
        this.$cartSum.textContent = "";
    }
}

var catalogId, cartId;
const goodsList = new GoodsList();
const cartList = new CartList();