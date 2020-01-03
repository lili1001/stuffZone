let addToCart = async itemId => {
  console.log("start of addToCart");
  let returnedCart = undefined;
  let updateCart = async () => {
    console.log("start updating cart...");
    let response = await fetch("/fetch-cart", {
      method: "GET"
    });
    let body = await response.text();
    returnedCart = JSON.parse(body);
    console.log("returnedCart", returnedCart);
  };

  let data = new FormData();
  data.append("adding", true);
  data.append("itemId", itemId);
  console.log("adding itemId: ", itemId);
  let res = await fetch("/cart", {
    method: "POST",
    body: data,
    credentials: "include"
  });
  let body = await res.text();
  let response = JSON.parse(body);
  if (!response.success) {
    alert("add to cart failed");
    return;
  }
  await updateCart();
  return returnedCart;
};

export default addToCart;
