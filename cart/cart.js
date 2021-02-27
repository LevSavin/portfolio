var CatalogItem = function (name, imgSrc, price) {
    this.name = name;
    this.imgSrc = imgSrc;
    this.price = price;
};

var i1 = new CatalogItem("Леггинсы", "img/1.jpg", 3000);
var i2 = new CatalogItem("Платье", "img/2.jpg", 4000);
var i3 = new CatalogItem("Свитер", "img/3.jpg", 5000);

var CartItem = function (name, imgSrc, price) {
    this.name = selectedItem.name;
    this.imgSrc = selectedItem.imgSrc;
    this.price = selectedItem.price;
}

var itemsArray = [i1, i2, i3];
var cartArray = []
var sum = 0;
var selectedItems = document.querySelector(".selected-items"); //корзина в html
var selectedItem, indexOfname;
var cartItem = {};

function init() {
    var catalog = document.querySelector(".catalog");
    var i, item;

    for (i = 0; i < itemsArray.length; i++) { // заполняем каталог товарами из массива itemsArray
        item = document.createElement("div"); // создали блок
        item.classList.add("div__item");

        itemImg = document.createElement("img");
        itemImg.src = itemsArray[i].imgSrc;
        itemImg.classList.add("div__img");
        item.append(itemImg); // добавили в блок картинку товара

        itemContent = document.createElement("div");
        itemContent.classList.add("div__item_goods-content");
        itemContent.append(document.createTextNode(itemsArray[i].name + " "));
        itemContent.append(document.createTextNode(itemsArray[i].price + "\u20bd"));

        itemBtn = document.createElement("button");
        itemBtn.classList.add("div__button");
        itemBtn.innerText = "Добавить";
        itemBtn.setAttribute("id", "btn_" + i); // у каждого товара кнопка с уникальным id
        itemBtn.onclick = addItem;
        itemContent.append(itemBtn);

        item.append(itemContent);
        catalog.append(item); // добавиили товар в каталог
    }
}

function addItem(obj) {
    itemNum = obj.target.id.split("_")[1] //индекс товара из массива товаров в каталоге
    selectedItem = itemsArray[itemNum];

    if (isHasAlready() == undefined) { // если товара нет в корзине, то добавить его
        cartItem = new CartItem(selectedItem.name, selectedItem.imgSrc, selectedItem.price)
        cartArray.push(cartItem)
        indexOfname = cartArray.findIndex(x => x.name === itemsArray[itemNum].name);
        cartArray[indexOfname].quantity = 1; // увеличить количество
        var tr = selectedItems.insertRow(-1); // индекс -1 - строка добавляется как последняя
        tr.setAttribute("id", "itemString_" + itemNum);
        var td = tr.insertCell(-1);
        td.append(document.createTextNode(cartItem.name + " " + cartItem.quantity + " шт."));
        td.setAttribute("id", "itemQuantity_" + itemNum);
        var td = tr.insertCell(-1);
        td.append(document.createTextNode((cartItem.price * cartItem.quantity) + "\u20bd"));
        td.setAttribute("id", "price" + itemNum);

        var td = tr.insertCell(-1);
        removeBtn = document.createElement("button");
        removeBtn.innerText = "-";
        removeBtn.setAttribute("id", "removeBtn_" + itemNum); // у каждого товара кнопка с уникальным id
        removeBtn.onclick = removeItem;
        td.append(removeBtn);
    } else {
        indexOfname = cartArray.findIndex(x => x.name === itemsArray[itemNum].name); // ищем индекс добавленного товара в корзине
        cartArray[indexOfname].quantity += 1; // увеличить количество
        changePrice()
    }
    countSum();
}

function isHasAlready() { // проверяем по названию, есть ли уже в корзине выбранный товар
    var searchCatalog = selectedItem.name;
    searchCart = cartArray.find(x => x.name === searchCatalog);
    return searchCart;
}

function removeItem(obj) { // уменьшить количество товара / скрыть позицию
    itemNum = obj.target.id.split("_")[1] // индекс товара из массива товаров в каталоге
    indexOfname = cartArray.findIndex(x => x.name === itemsArray[itemNum].name); // индекс товара из массива корзины
    if (cartArray[indexOfname].quantity > 1) {
        cartArray[indexOfname].quantity -= 1; // уменьшить количество
        changePrice()
    } else {
        var remItem = document.getElementById("itemString_" + itemNum)
        remItem.remove()
        cartArray.splice(indexOfname, 1)
    }
    countSum()
}

function changePrice() { // изменить итог стоимости позиции
    var changedItem = document.getElementById("price" + itemNum);
    changedItem.textContent = ((cartArray[indexOfname].price * cartArray[indexOfname].quantity) + "\u20bd");
    var changedItem = document.getElementById("itemQuantity_" + itemNum);
    changedItem.textContent = (cartArray[indexOfname].name + " " + cartArray[indexOfname].quantity + " шт.");
}

function countSum() { // считаем итоговую сумму корзины
    var initialValue = 0; // объект, используемый в качестве первого аргумента при первом вызове функции callback
    sum = cartArray.reduce(function (accumulator, currentValue) { // подсчёт суммы по товарам в корзине
        return accumulator + (currentValue.price * currentValue.quantity);
    }, initialValue);
    document.querySelector(".sum").textContent = "Сумма: " + sum + "\u20bd";
}

function clearCart() { // очистка корзины
    sum = 0;
    cartArray.forEach(function (item) {
        item.quantity = 0
    })
    cartArray = [];
    selectedItems.textContent = '';
    countSum();
}

window.onload = init;