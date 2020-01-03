import React, { Component } from "react";
import {
  format,
  formatDistance,
  formatRelative,
  subDays,
  parseISO
} from "date-fns";
import styled from "styled-components";
import formatMoney from "./formatMoney";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
// testin testing

const Canvas = styled.div`
  width: 100%;
  justify-content: center;
  h2 {
    margin: 1rem;
    margin-bottom: 0;
  }
`;

const OrderItemStyles = styled.div`
  width: 40vw;

  margin: 1rem;
  box-shadow: white;
  list-style: none;
  padding: 2rem;
  border: 1px solid #696969;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.55);

  a,
  p {
    border-radius: 15px;
    color: #696969;
    text-decoration: none;
  }

  .images {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    margin-top: 1rem;

    img {
      border-radius: 3px;
      height: 200px;
      object-fit: cover;
      width: 100%;
    }
  }
  .order-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10px, 1fr));
    grid-gap: 1rem;
    text-align: center;
    & > * {
      margin: 0;
      background: rgba(0, 0, 0, 0.03);
      padding: 1rem 0;
    }
    strong {
      display: block;
      margin-bottom: 1rem;
    }
  }
`;

const OrderUl = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 15px;
  width: fit-content;
`;

class unconnectedPastOrders extends Component {
  constructor(props) {
    super(props);
    this.state = { orders: [] };
  }

  componentDidMount() {
    let fetchAll = async () => {
      let response = await fetch("/fetch-orders", {
        method: "GET"
      });
      let body = await response.text();
      let returnedOrders = JSON.parse(body);
      //console.log("returnedOrders", returnedOrders);
      this.setState({ ...this.state, orders: returnedOrders });
      return;
    };
    fetchAll();
  }

  render() {
    let orders = this.state.orders;
    this.props.dispatch({
      type: "orders",
      orders: this.state.orders
    });

    console.log("orders in render", orders);

    return (
      <Canvas>
        <div>
          <h2>You have {orders.length} completed orders</h2>
          <OrderUl>
            {orders.map(order => (
              <OrderItemStyles key={order.orderId}>
                <Link to={"/orders/" + order.orderId}>
                  <div className="order-meta">
                    <p>{order.items.length} Items</p>
                    <p>
                      Ordered{" "}
                      {formatRelative(parseISO(order.createdAt), new Date())}
                    </p>
                    <p>Order Total: {formatMoney(order.total)}</p>
                  </div>
                  <div className="images">
                    {order.items.map(item => (
                      <img
                        key={item.id}
                        src={item.smallImage}
                        alt={item.title}
                      />
                    ))}
                  </div>
                </Link>
              </OrderItemStyles>
            ))}
          </OrderUl>
        </div>
      </Canvas>
    );
  }
}

let mapStateToProps = st => {
  return {
    orders: st.orders
  };
};

let PastOrders = connect(mapStateToProps)(unconnectedPastOrders);
export default PastOrders;
